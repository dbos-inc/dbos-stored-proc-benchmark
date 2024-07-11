import { StoredProcedure, StoredProcedureContext, Workflow, WorkflowContext, GetApi, ArgSource, ArgSources } from '@dbos-inc/dbos-sdk';

// The schema of the database table used in this example.
export interface dbos_hello {
    name: string;
    greet_count: number;
}

export class StoredProcTest {
    @GetApi('/greet_count/:user')
    @Workflow()
    static async getGreetCountWorkflow(ctxt: WorkflowContext, @ArgSource(ArgSources.URL) user: string) {
        return ctxt.invoke(StoredProcTest).getGreetCount(user);
    }

    @StoredProcedure({ readOnly: true })
    static async getGreetCount(ctxt: StoredProcedureContext, user: string): Promise<number> {
        const query = "SELECT greet_count FROM dbos_hello WHERE name = $1;";
        const { rows } = await ctxt.query<dbos_hello>(query, [user]);
        return rows.length === 0 ? 0 : rows[0].greet_count;
    }

    @GetApi('/hello/:user')
    @Workflow()
    static async helloWorkflow(ctxt: WorkflowContext, @ArgSource(ArgSources.URL) user: string) {
        return ctxt.invoke(StoredProcTest).helloProcedure(user);
    }

    @StoredProcedure()  // Run this function as a database transaction
    static async helloProcedure(ctxt: StoredProcedureContext, user: string): Promise<string> {
        const query = "INSERT INTO dbos_hello (name, greet_count) VALUES ($1, 1) ON CONFLICT (name) DO UPDATE SET greet_count = dbos_hello.greet_count + 1 RETURNING greet_count;";
        const { rows } = await ctxt.query<dbos_hello>(query, [user]);
        const greet_count = rows[0].greet_count;
        return `Hello, ${user}! You have been greeted ${greet_count} times.\n`;
    }
}