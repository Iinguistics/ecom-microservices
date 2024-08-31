import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Database } from './database';

export class EcomMicroservicesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const database = new Database(this, 'Database')

  }
}
