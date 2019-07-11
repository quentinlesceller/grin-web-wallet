import { Component, OnDestroy, OnInit } from '@angular/core';
import { WalletService } from '../../../services/wallet.service';
import { UtilService } from '../../../services/util.service';
import { WalletInfo } from '../../../model/walletinfo';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-output-list-display',
  templateUrl: './output-list-display.html',
  styleUrls: ['./output-list-display.css']
})
export class OutputListDisplayComponent implements OnInit, OnDestroy {

  info: WalletInfo;
  navigationSubscription;

  constructor(public walletService: WalletService,
    public util: UtilService,
    private router: Router) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.getWalletInfo();
      }
    });
  }

  getWalletInfo(): void {
    console.log('Wallet-info output list subscription');
    this.walletService.getWalletInfo().then(
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
            var info: WalletInfo = data.result['Ok'][1];
            this.info = info;
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
