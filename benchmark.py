import requests
import json
import argparse
import statistics
import numpy as np

# Function to send GET request and get latency
def get_request_latency(session, url, suffix, num_operations):
    response = session.get(f"{url}/{suffix}/{num_operations}")
    response_json = response.json()
    return response_json.get('runtime')

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Measure DBOS server-side latency')
    parser.add_argument('-u', '--url', required=True, help='The DBOS application URL')
    parser.add_argument('-n', '--num-executions', required=True, type=int, help='The number of executions to benchmark')
    parser.add_argument('-o', '--num-operations', required=True, type=int, help='The number of operations to perform in each transaction')
    parser.add_argument('-v', '--verbose', action='store_true', help="Verbose mode")

    args = parser.parse_args()

    # Parameters
    url = args.url
    num_executions = args.num_executions
    num_operations = args.num_operations
    verbose = args.verbose

    # Send GET request specified number of times and report latencies
    for target, suffix in [("Stored Procedure", "sp"), ("Transaction", "txn")]:
        latencies = []
        with requests.Session() as session:
            for i in range(num_executions):
                latency_ms = get_request_latency(session, url, suffix, num_operations)
                latencies.append(latency_ms)
                if verbose:
                    print(f'{target} Execution {i+1} latency: {latency_ms:.2f} milliseconds')

        # Compute summary statistics
        average_latency = sum(latencies) / len(latencies)
        max_latency = max(latencies)
        min_latency = min(latencies)
        median_latency = statistics.median(latencies)
        p99_latency = np.percentile(latencies, 99)

        print(f"\nSummary of {target} Latencies:")
        print(f'Average Latency: {average_latency:.2f} milliseconds')
        print(f'Max Latency: {max_latency:.2f} milliseconds')
        print(f'Min Latency: {min_latency:.2f} milliseconds')
        print(f'Median Latency: {median_latency:.2f} milliseconds')
        print(f'99th Percentile Latency: {p99_latency:.2f} milliseconds')
