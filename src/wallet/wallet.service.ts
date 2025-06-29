import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entity/wallet.entity';
import { Post } from 'src/post/post.entity';
import { DailyEarning } from './entity/daily-earning.entity';
import { Withdrawal } from './entity/withdrawals.entity';
import { PayPalService } from './services/paypal.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    @InjectRepository(DailyEarning)
    private dailyEarningRepository: Repository<DailyEarning>,
    @InjectRepository(Post)
    private postRepository: Repository<Post>,
    @InjectRepository(Withdrawal)
    private withdrawalRepository: Repository<Withdrawal>,
    private paypalService: PayPalService,
  ) {}

  async createWallet(creatorId: string) {
    const existingWallet = await this.walletRepository.findOne({ where: { creatorId } });
    if (existingWallet) {
      throw new BadRequestException('Wallet already exists for this creator.');
    }

    const newWallet = this.walletRepository.create({ creatorId, balance: 0 });
    return this.walletRepository.save(newWallet);
  }

  async getWalletByCreatorId(creatorId: string) {
    const wallet = await this.walletRepository.findOne({ where: { creatorId } });
    if (!wallet) {
      throw new BadRequestException(`Wallet not found for creatorId: ${creatorId}`);
    }
    return wallet;
  }

  async linkPayPal(creatorId: string, paypalEmail: string) {
    const wallet = await this.walletRepository.findOne({ where: { creatorId } });
    
    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    wallet.paypalEmail = paypalEmail;
    wallet.paypalVerified = true;
    
    return this.walletRepository.save(wallet);
  }

  async requestWithdrawal(creatorId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Invalid withdrawal amount');
    }

    if (amount < 5) {
      throw new BadRequestException('Minimum withdrawal amount is $5');
    }

    const wallet = await this.walletRepository.findOne({ where: { creatorId } });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    if (!wallet.paypalEmail) {
      throw new BadRequestException('Please link your PayPal account first');
    }

    if (amount > wallet.balance) {
      throw new BadRequestException('Insufficient balance');
    }

    const withdrawal = this.withdrawalRepository.create({
      creatorId,
      amount,
      status: 'PENDING',
      paypalEmail: wallet.paypalEmail,
      createdAt: new Date(),
    });

    wallet.balance -= amount;

    await this.walletRepository.save(wallet);
    const savedWithdrawal = await this.withdrawalRepository.save(withdrawal);

    try {
      const payoutResult = await this.paypalService.sendPayout(
        wallet.paypalEmail,
        amount,
        'USD'
      );

      savedWithdrawal.paypalBatchId = payoutResult.batchId;
      savedWithdrawal.paypalPayoutItemId = payoutResult.payoutItemId;
      savedWithdrawal.status = 'PROCESSING';
      
      await this.withdrawalRepository.save(savedWithdrawal);

      return {
        ...savedWithdrawal,
        message: 'Withdrawal request submitted successfully. Processing via PayPal.'
      };
    } catch (error) {

      wallet.balance += amount;
      await this.walletRepository.save(wallet);

      savedWithdrawal.status = 'FAILED';
      savedWithdrawal.failureReason = error.message;
      await this.withdrawalRepository.save(savedWithdrawal);

      throw new BadRequestException('Withdrawal failed: ' + error.message);
    }
  }

  async getWithdrawalHistory(creatorId: string) {
    return this.withdrawalRepository.find({
      where: { creatorId },
      order: { createdAt: 'DESC' }
    });
  }


  @Cron('*/30 * * * * *') 
  async updateWithdrawalStatuses() {
    console.log('Starting withdrawal status update...');
    
    const processingWithdrawals = await this.withdrawalRepository.find({
      where: { status: 'PROCESSING' }
    });

    console.log(`Found ${processingWithdrawals.length} processing withdrawals`);

    for (const withdrawal of processingWithdrawals) {
      if (withdrawal.paypalBatchId) {
        try {
          console.log(`Checking status for withdrawal ${withdrawal.id}, batch: ${withdrawal.paypalBatchId}`);

          const payoutStatus = await this.paypalService.getPayoutStatus(withdrawal.paypalBatchId);
          
          console.log(`Batch status: ${payoutStatus.status}`);
          console.log(`Items count: ${payoutStatus.items?.length || 0}`);
          
          if (payoutStatus.items && payoutStatus.items.length > 0) {

            for (const item of payoutStatus.items) {
              console.log(`Item status: ${item.transaction_status}, Item ID: ${item.payout_item_id}`);
              

              if (withdrawal.paypalPayoutItemId && item.payout_item_id === withdrawal.paypalPayoutItemId) {
                await this.updateWithdrawalFromItem(withdrawal, item);
                break;
              }

              else if (!withdrawal.paypalPayoutItemId && payoutStatus.items.length === 1) {
                await this.updateWithdrawalFromItem(withdrawal, item);
                break;
              }
            }
          }

          if (withdrawal.paypalPayoutItemId && withdrawal.status === 'PROCESSING') {
            try {
              const itemStatus = await this.paypalService.getPayoutItemStatus(withdrawal.paypalPayoutItemId);
              console.log(`Individual item status: ${itemStatus.status}`);
              
              if (itemStatus.status === 'SUCCESS') {
                withdrawal.status = 'COMPLETED';
                await this.withdrawalRepository.save(withdrawal);
                console.log(`Withdrawal ${withdrawal.id} marked as COMPLETED`);
              } else if (itemStatus.status === 'FAILED') {
                withdrawal.status = 'FAILED';
                withdrawal.failureReason = itemStatus.errors?.message || 'PayPal transaction failed';

                await this.refundToWallet(withdrawal);
                await this.withdrawalRepository.save(withdrawal);
                console.log(`Withdrawal ${withdrawal.id} marked as FAILED and refunded`);
              }
            } catch (itemError) {
              console.error(`Failed to get individual item status for ${withdrawal.paypalPayoutItemId}:`, itemError);
            }
          }
          
        } catch (error) {
          console.error(`Failed to update withdrawal ${withdrawal.id}:`, error);
        }
      }
    }
    
    console.log('Withdrawal status update completed');
  }

  private async updateWithdrawalFromItem(withdrawal: Withdrawal, item: any) {
    const status = item.transaction_status?.toLowerCase();
    
    console.log(`Updating withdrawal ${withdrawal.id} with item status: ${status}`);
    
    if (status === 'success' || status === 'completed' || status === 'claimed') {
      withdrawal.status = 'COMPLETED';
      await this.withdrawalRepository.save(withdrawal);
      console.log(`Withdrawal ${withdrawal.id} marked as COMPLETED`);
    } 
    else if (status === 'failed' || status === 'returned' || status === 'refunded' || status === 'blocked') {
      withdrawal.status = 'FAILED';
      withdrawal.failureReason = item.errors?.message || `PayPal transaction ${status}`;
      
      
      await this.refundToWallet(withdrawal);
      await this.withdrawalRepository.save(withdrawal);
      console.log(`Withdrawal ${withdrawal.id} marked as FAILED and refunded`);
    }
  }

  private async refundToWallet(withdrawal: Withdrawal) {
    const wallet = await this.walletRepository.findOne({ 
      where: { creatorId: withdrawal.creatorId } 
    });
    
    if (wallet) {
      wallet.balance += withdrawal.amount;
      await this.walletRepository.save(wallet);
      console.log(`Refunded $${withdrawal.amount} to wallet for creator ${withdrawal.creatorId}`);
    }
  }

  async forceCheckWithdrawal(withdrawalId: string) {
    const withdrawal = await this.withdrawalRepository.findOne({ 
      where: { id: withdrawalId } 
    });
    
    if (!withdrawal) {
      throw new BadRequestException('Withdrawal not found');
    }

    if (withdrawal.status !== 'PROCESSING') {
      return { message: 'Withdrawal is not in processing status' };
    }

    if (!withdrawal.paypalBatchId) {
      throw new BadRequestException('No PayPal batch ID found');
    }

    try {
      const payoutStatus = await this.paypalService.getPayoutStatus(withdrawal.paypalBatchId);
      
      if (payoutStatus.items && payoutStatus.items.length > 0) {
        const item = payoutStatus.items[0];
        await this.updateWithdrawalFromItem(withdrawal, item);
      }

      return { message: 'Status check completed', withdrawal };
    } catch (error) {
      throw new BadRequestException(`Failed to check withdrawal status: ${error.message}`);
    }
  }
}