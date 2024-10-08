# DBOS Stored Procedure Benchmarks

This repository contains code to benchmark the performance of DBOS stored procedures. Specifically, it measures how much compiling functions to stored procedures improves their latency.

# Benchmark Information

The benchmark runs a transaction performing a varying number of simple upsert operations. It reports that transaction's server-side latency with and without compilation to a PostgreSQL stored procedure.

# Benchmark Instructions

To run the benchmark, deploy the application to DBOS Cloud (assuming you already have a DBOS Cloud account):

```
npm i
npx dbos-cloud login
npx dbos-cloud db provision <db-name> -U <db-username> -W <db-password>
npx dbos-cloud app register -d <db-name>
npx dbos-cloud app deploy
```

Then, run the benchmark:

```
python3 benchmark.py -u <app-url> -n <number-of-iterations> -o <operations-per-transaction>
```

To obtain your DBOS app URL, run `npx dbos-cloud app status` in the DBOS app directory.