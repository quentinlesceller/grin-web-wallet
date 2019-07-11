
export class OutputsResponse {
  validated_against_node: boolean;
  outputs_commit_mapping: OutputCommitMapping[];
}

export class OutputCommitMapping {
  commit: string;
  output: Output;
}

export class Output {
  root_key_id: string;
  key_id: string;
  n_child: number;
  commit: string;
  mmr_index: number;
  value: number;
  status: string;
  height: number;
  lock_height: number;
  is_coinbase: boolean;
  tx_log_entry: number;
}

