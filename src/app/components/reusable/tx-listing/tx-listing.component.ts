import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { WalletService } from '../../../services/wallet.service';
import { TxLogEntry } from '../../../model/tx-log-entry';
import { UtilService } from '../../../services/util.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-tx-listing',
  templateUrl: './tx-listing.component.html',
  styleUrls: ['./tx-listing.component.css']
})
export class TxListingComponent implements OnInit, OnDestroy {
  txs: TxLogEntry[];
  navigationSubscription;
  @Input() num_entries: number;

  constructor(public walletService: WalletService,
    public util: UtilService,
    private router: Router) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.getTxs();
      }
    });
  }

  getTxs(): void {
    console.log('Tx-Listing subscription');
    this.walletService.getTxLogs().then(
      response => {
        var data = response.data;
        if (data.error) {
          // TODO
          console.log(data.error)
        } else {
          if (!data.result['Ok'][0]) {
            // TODO
            console.log("Not refreshed from node");
          } else {
            var txs: TxLogEntry[] = data.result['Ok'][1];
            this.txs = txs;
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

}
