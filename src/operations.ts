import { StoredProcedure, StoredProcedureContext, GetApi, HandlerContext, TransactionContext, Transaction } from '@dbos-inc/dbos-sdk';
import { Knex } from 'knex';

// The schema of the database table used in this example.
export interface dbos_hello {
    name: string;
    greet_count: number;
}

export class StoredProcBenchmark {

    @GetApi('/sp/:user')
    static async benchmarkStoredProc(ctxt: HandlerContext, user: string) {
        const startTime = performance.now();
        const output = await ctxt.invoke(StoredProcBenchmark).runStoredProc(user);
        const elapsedTime = performance.now() - startTime;
        return {
            output: output,
            runtime: elapsedTime,
        };
    }

    @StoredProcedure()
    static async runStoredProc(ctxt: StoredProcedureContext, user: string): Promise<string> {
        const query = "INSERT INTO dbos_hello (name, greet_count) VALUES ($1, 1) ON CONFLICT (name) DO UPDATE SET greet_count = dbos_hello.greet_count + 1 RETURNING greet_count;";
        const { rows } = await ctxt.query<dbos_hello>(query, [user]);
        const greet_count = rows[0].greet_count;
        return `Hello, ${user}! You have been greeted ${greet_count} times.\n`;
    }

    @GetApi('/txn/:user')
    static async benchmarkTransaction(ctxt: HandlerContext, user: string) {
        const startTime = performance.now();
        const output = await ctxt.invoke(StoredProcBenchmark).runTransaction(user);
        const elapsedTime = performance.now() - startTime;
        return {
            output: output,
            runtime: elapsedTime,
        };
    }

    @Transaction()
    static async runTransaction(ctxt: TransactionContext<Knex>, user: string): Promise<string> {
        const query = "INSERT INTO dbos_hello (name, greet_count) VALUES (?, 1) ON CONFLICT (name) DO UPDATE SET greet_count = dbos_hello.greet_count + 1 RETURNING greet_count;";
        const { rows } = await ctxt.client.raw(query, [user]) as { rows: dbos_hello[] };
        const greet_count = rows[0].greet_count;
        return `Hello, ${user}! You have been greeted ${greet_count} times.\n`;
    }
}