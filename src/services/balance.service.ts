import { EVMService } from './evm.service';
import { TronService } from './tron.service';

export class BalanceService {
  private evm = new EVMService();
  private tron = new TronService();

  async getNativeBalance(address: string, chain: 'EVM' | 'TRON'): Promise<string> {
    if (chain === 'EVM') return this.evm.getBalance(address);
    return this.tron.getBalance(address);
  }
}


