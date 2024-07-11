import { StoredProcedure, StoredProcedureContext, GetApi, HandlerContext, TransactionContext, Transaction } from '@dbos-inc/dbos-sdk';
import { Knex } from 'knex';

// The schema of the database table used in this example.
export interface dbos_hello {
    name: string;
    greet_count: number;
}

export class StoredProcBenchmark {

    @GetApi('/sp/:iterations')
    static async benchmarkStoredProc(ctxt: HandlerContext, iterations: number) {
        const startTime = performance.now();
        const output = await ctxt.invoke(StoredProcBenchmark).runStoredProc("dbos", iterations);
        const elapsedTime = performance.now() - startTime;
        return {
            output: output,
            runtime: elapsedTime,
        };
    }

    @StoredProcedure()
    static async runStoredProc(ctxt: StoredProcedureContext, user: string, iterations: number): Promise<string> {
        let greet_count = null;
        for (let i = 0; i < iterations; i++) {
            const query = "INSERT INTO dbos_hello (name, greet_count) VALUES ($1, 1) ON CONFLICT (name) DO UPDATE SET greet_count = dbos_hello.greet_count + 1 RETURNING greet_count;";
            const { rows } = await ctxt.query<dbos_hello>(query, [user]);
            greet_count = rows[0].greet_count;
        }
        return `Hello, ${user}! You have been greeted ${greet_count} times.\n`;
    }

    @GetApi('/txn/:iterations')
    static async benchmarkTransaction(ctxt: HandlerContext, iterations: number) {
        const startTime = performance.now();
        const output = await ctxt.invoke(StoredProcBenchmark).runTransaction("dbos", iterations);
        const elapsedTime = performance.now() - startTime;
        return {
            output: output,
            runtime: elapsedTime,
        };
    }

    @Transaction()
    static async runTransaction(ctxt: TransactionContext<Knex>, user: string, iterations: number): Promise<string> {
        let greet_count = null;
        for (let i = 0; i < iterations; i++) {
            const query = "INSERT INTO dbos_hello (name, greet_count) VALUES (?, 1) ON CONFLICT (name) DO UPDATE SET greet_count = dbos_hello.greet_count + 1 RETURNING greet_count;";
            const { rows } = await ctxt.client.raw(query, [user]) as { rows: dbos_hello[] };
            greet_count = rows[0].greet_count;
        }
        return `Hello, ${user}! You have been greeted ${greet_count} times.\n`;
    }
}