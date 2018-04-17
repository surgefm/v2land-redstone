const grpc = require('grpc');
const grpcPromise = require('grpc-promise');
const path = require('path');

const proto = grpc.load(
  path.resolve('./v2land-grpc/protos/NewsCluster.proto')
).NewsCluster;

const client = new proto.NewsService(process.env['NLP_SERVICE_URL'], grpc.credentials.createInsecure());

grpcPromise.promisifyAll(client);

module.exports = client;
