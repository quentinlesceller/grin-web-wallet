import { Component, OnDestroy, OnInit } from '@angular/core';
import { WalletService } from '../../../services/wallet.service';
import { UtilService } from '../../../services/util.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TxLogEntry } from '../../../model/tx-log-entry';

@Component({
  selector: 'app-tx-detail',
  templateUrl: './tx-detail.component.html',
  styleUrls: ['./tx-detail.component.css']
})
export class TxDetailComponent implements OnInit, OnDestroy {

  tx: TxLogEntry;
  navigationSubscription;

  constructor(public walletService: WalletService,
    public util: UtilService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        const id = this.route.snapshot.paramMap.get('id');
        this.getTx(+id);
      }
    });
  }

  ngOnInit() {
  }

  getTx(id: number): void {
    console.log('Get TX Subscription');
    this.walletService.getTxLog(id).then(
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
            console.log(data.result['Ok'][1])
            var tx: TxLogEntry = data.result['Ok'][1][0];
            this.tx = tx;
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  ngOnDestroy() {
    if (this.navigationSubscription) {
      this.navigationSubscription.unsubscribe();
    }
  }

}
