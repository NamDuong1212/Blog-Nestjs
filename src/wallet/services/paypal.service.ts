import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PayPalConfig } from '../../config/paypal.config';
import * as paypal from '@paypal/payouts-sdk';

@Injectable()
export class PayPalService {
  private readonly logger = new Logger(PayPalService.name);
  private client = PayPalConfig.client();

  async sendPayout(
    recipientEmail: string,
    amount: number,
    currency: string = 'USD',
  ) {
    try {
      const requestBody = {
        sender_batch_header: {
          sender_batch_id: `batch_${Date.now()}`,
          email_subject: 'You have a payout!',
          email_message: 'You have received a payout from our platform!',
        },
        items: [
          {
            recipient_type: 'EMAIL',
            amount: {
              value: amount.toString(),
              currency: currency,
            },
            receiver: recipientEmail,
            note: 'Withdrawal from wallet',
            sender_item_id: `item_${Date.now()}`,
          },
        ],
      };

      const request = new paypal.payouts.PayoutsPostRequest();
      request.requestBody(requestBody);

      const response = await this.client.execute(request);

      this.logger.log(
        'PayPal payout response:',
        JSON.stringify(response.result, null, 2),
      );

      if (!response.result || !response.result.batch_header) {
        throw new Error('Invalid PayPal response structure');
      }

      const batchId = response.result.batch_header.payout_batch_id;
      const batchStatus = response.result.batch_header.batch_status;

      let payoutItemId = null;
      if (response.result.items && response.result.items.length > 0) {
        payoutItemId = response.result.items[0].payout_item_id;
      }

      this.logger.log(`PayPal payout sent successfully: ${batchId}`);

      return {
        batchId: batchId,
        status: batchStatus,
        payoutItemId: payoutItemId,
      };
    } catch (error) {
      this.logger.error('PayPal payout failed:', error);

      if (error.response) {
        this.logger.error(
          'PayPal API Error Response:',
          JSON.stringify(error.response, null, 2),
        );
      }

      if (error.statusCode) {
        throw new BadRequestException(
          `PayPal payout failed (${error.statusCode}): ${error.message}`,
        );
      }

      throw new BadRequestException(
        `PayPal payout failed: ${error.message || 'Unknown error'}`,
      );
    }
  }

  async getPayoutStatus(payoutBatchId: string) {
    try {
      const request = new paypal.payouts.PayoutsGetRequest(payoutBatchId);
      const response = await this.client.execute(request);

      this.logger.log(
        'PayPal status response:',
        JSON.stringify(response.result, null, 2),
      );

      const batchHeader = response.result?.batch_header;
      const items = response.result?.items || [];

      const batchStatus = batchHeader?.batch_status;

      this.logger.log(`Batch Status: ${batchStatus}`);
      if (items.length > 0) {
        items.forEach((item, index) => {
          this.logger.log(`Item ${index} Status: ${item.transaction_status}`);
          this.logger.log(`Item ${index} ID: ${item.payout_item_id}`);
        });
      }

      const result = {
        batchId: batchHeader?.payout_batch_id || payoutBatchId,
        status: batchStatus || 'UNKNOWN',
        items: items.map((item) => ({
          ...item,

          transaction_status: this.normalizeTransactionStatus(
            item.transaction_status,
          ),
        })),
      };

      return result;
    } catch (error) {
      this.logger.error('Failed to get payout status:', error);

      if (error.statusCode) {
        throw new BadRequestException(
          `Failed to get payout status (${error.statusCode}): ${error.message}`,
        );
      }

      throw new BadRequestException(
        `Failed to get payout status: ${error.message || 'Unknown error'}`,
      );
    }
  }

  private normalizeTransactionStatus(status: string): string {
    if (!status) return 'UNKNOWN';

    const normalizedStatus = status.toLowerCase();

    switch (normalizedStatus) {
      case 'success':
      case 'completed':
      case 'claimed':
        return 'SUCCESS';
      case 'failed':
      case 'returned':
      case 'refunded':
      case 'blocked':
        return 'FAILED';
      case 'pending':
      case 'unclaimed':
        return 'PENDING';
      default:
        this.logger.warn(`Unknown PayPal status: ${status}`);
        return status.toUpperCase();
    }
  }

  async getPayoutItemStatus(payoutItemId: string) {
    try {
      const request = new paypal.payouts.PayoutsItemGetRequest(payoutItemId);
      const response = await this.client.execute(request);

      this.logger.log(
        'PayPal item status response:',
        JSON.stringify(response.result, null, 2),
      );

      return {
        itemId: response.result?.payout_item_id,
        status: this.normalizeTransactionStatus(
          response.result?.transaction_status,
        ),
        amount: response.result?.payout_item?.amount,
        recipient: response.result?.payout_item?.receiver,
        errors: response.result?.errors,
      };
    } catch (error) {
      this.logger.error('Failed to get payout item status:', error);
      throw new BadRequestException(
        `Failed to get payout item status: ${error.message || 'Unknown error'}`,
      );
    }
  }
}
