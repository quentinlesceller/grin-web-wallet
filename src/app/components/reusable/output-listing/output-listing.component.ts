import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { WalletService } from '../../../services/wallet.service';
import { UtilService } from '../../../services/util.service';
import { OutputsResponse, Output, OutputCommitMapping } from '../../../model/output';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-output-listing',
  templateUrl: './output-listing.component.html',
  styleUrls: ['./output-listing.component.css']
})
export class OutputListingComponent implements OnInit, OnDestroy {
  outputs: Output[];
  navigationSubscription;
  @Input() num_entries: number;
  @Input() condensed: boolean;
  tx_id: string;

  constructor(
    public walletService: WalletService,
    public util: UtilService,
    private router: Router,
    private route: ActivatedRoute) {
    this.navigationSubscription = this.router.events.subscribe((e: any) => {
      if (e instanceof NavigationEnd) {
        this.tx_id = this.route.snapshot.params['id'];
        console.log('route_tx_id' + this.tx_id);
        let num = null;
        let show_spent = false;
        if (this.tx_id !== undefined) {
          num = +this.tx_id;
          show_spent = true;
        }
        this.getOutputs(num, show_spent);
      }
    });
  }

  getOutputs(id: number, show_spent: boolean): void {
    console.log('Output-Listing subscription');
    this.walletService.getOutputs(show_spent, id).then(
      response => {
        var data = response.data;
        if (data.error) {
          // TODO
          console.log(data.error)
        } else {
          var outputsResponse: OutputsResponse = data.result['Ok'];
          if (!outputsResponse[0]) {
            // TODO
            console.log("Not refreshed from node outputs");
          } else {
            console.log(outputsResponse[1])
            var outputsCommitMapping: OutputCommitMapping[] = outputsResponse[1];
            // Convert to outputs array
            var outputs: Output[] = []
            outputsCommitMapping.forEach(outputCommitMapping => {
              outputs.push(outputCommitMapping.output);
            });
            this.outputs = outputs;
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
