import { Body, Controller, Post, UseGuards, Request, Param } from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiTags('Report')
  @ApiBearerAuth('token')
  @ApiOperation({ 
    summary: 'Create a report',
    description: 'Allows a logged-in user to report a post'  
  }) 
  @ApiResponse({
    status: 201,
    description: 'Report created successfully',
    type: CreateReportDto,
  })
  @Post('/create/:postId')
  @UseGuards(JwtAuthGuard)
  async createReport(@Param('postId') postId: string, @Body('reason') reason: string, @Request() req) {
    const userId = req.user.id;
    const report = await this.reportService.createReport(reason, postId, userId);
    return {
      message: 'Report created successfully',
      data: report,
    };
  }
}
