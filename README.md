# Big Data Project

This project illustrates an approach of creating an end to end pipeline for a big data project for academic purposes.

## Requirements

To start things off, you need to to have the following setup/installed:

- [docker & docker compose](https://www.docker.com/)
- A local kubernetes cluster (e.g. [minikube](https://minikube.sigs.k8s.io/docs/start/))
- [kubectl](https://kubernetes.io/docs/reference/kubectl/)
- [helm](https://helm.sh/)
- [fission](https://fission.io/docs/installation/)
- [Task](https://taskfile.dev/usage/) (optional)
- [Make](https://www.gnu.org/software/make/) (optional)

## Getting started

### Start the services

The steps below are just an overview, and the full documentation can be found in the submodules themselves.

- Start a `hadoop` cluster

```bash
(cd docker-hadoop && make build && make up)
```

- Start `spark` and `cassandra`

```bash
(cd cassandra-spark-docker && task up)
```

### Create the output tables

Open a shell directly to cassandra

```bash
(cd cassandra-spark-docker && task cqlsh)
```

Create the `cleaned_data` keyspace and the `salbes_alanytics` table

```sql
CREATE KEYSPACE cleaned_data WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
USE cleaned_data;
CREATE TABLE sales_analytics (
    store text PRIMARY KEY,
    total_sales double
);

DESCRIBE TABLE sales_analytics;
SELECT * FROM sales_analytics;

-- Truncate the table
TRUNCATE sales_analytics;
```

### Run the pyspark process

```bash
(cd cassandra-spark-docker/examples && task build-python && task run-python)
```

You can verify using the `SELECT` command above in the `cqlsh` to see the populated table.

## Resources

- <https://stackoverflow.com/questions/35762459/add-jar-to-standalone-pyspark>
- <https://anant.us/blog/modern-business/data-operations-with-spark-and-cassandra/>
