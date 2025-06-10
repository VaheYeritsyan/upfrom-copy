import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsManager from "aws-cdk-lib/aws-secretsmanager";
import { RDS, StackContext } from 'sst/constructs';

const scalingConfig: { [key: string]: object } = {
  prod: {
    autoPause: false,
    minCapacity: 'ACU_2',
    maxCapacity: 'ACU_8',
  },
  staging: {
    autoPause: false,
    minCapacity: 'ACU_2', 
    maxCapacity: 'ACU_4',
  },
  dev: {
    autoPause: true,
    minCapacity: 'ACU_2',
    maxCapacity: 'ACU_2',
  },
};

export function Database({ stack, app }: StackContext) {
  const secret = secretsManager.Secret.fromSecretCompleteArn(
    stack,
    "ISecret",
    "arn:aws:secretsmanager:us-east-1:083084509884:secret:rds-db-credentials/cluster-QI7VZL3QRCICINR6OGGRTS7VJY/postgres/1748275939408-KWdOIf"
  );

  const rdsInstance = new RDS(stack, "Database", {
    engine: "postgresql16.1",
    defaultDatabaseName: "postgres",
    cdk: {
      cluster: rds.ServerlessCluster.fromServerlessClusterAttributes(stack, "ICluster", {
        clusterIdentifier: "dev-upfrom",
        clusterEndpointAddress: "dev-upfrom.cluster-c6rmcgm048ov.us-east-1.rds.amazonaws.com",
        port: 5432,
        secret,
      }),
      secret,
    },
    types: "packages/repository/src/rds/sql.generated.ts",
    // migrations: "packages/repository/src/rds/migrations",
    scaling: scalingConfig[app.stage] || scalingConfig.dev,
  }); 

  return { rdsInstance };
}