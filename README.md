# Big Data Project

This project illustrates an approach of creating an end to end pipeline for a big data project for academic purposes.

## Requirements

To start things off, you need to to have the following setup/installed:

<!-- - A local kubernetes cluster (e.g. [minikube](https://minikube.sigs.k8s.io/docs/start/))
- [fission](https://fission.io/docs/installation/) -->

- [docker & docker compose](https://www.docker.com/)
- [kubectl](https://kubernetes.io/docs/reference/kubectl/)
- [helm](https://helm.sh/)
- [Task](https://taskfile.dev/usage/) (optional)
- [Make](https://www.gnu.org/software/make/) (optional)
- [node](https://nodejs.org/en)

## Getting started

### Clone the submodules

```bash
git submodule update --init --recursive
```

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

Create the `cleaned_data` keyspace and the `sales_analytics` table

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

Make sure that you also download the `purchases.txt` file if not already.
See the [quick start section of docker-hadoop](docker-hadoop/README.md#quick-start) for more details.
This will make sure it is mounted to the container's filesystem where HDFS can access it.

Now, copy the file to the HDFS cluster

```bash
(cd docker-hadoop && make shell)

$ ls -l /data/purchases.txt
# -rw-r--r-- 1 root root 211312924 Nov 20 15:17 /data/purchases.txt
$ hdfs dfs -mkdir /input
$ hdfs dfs -copyFromLocal /data/purchases.txt /input/
$ hdfs dfs -ls /input
# -rw-r--r--   3 root supergroup  211312924 2024-11-20 15:26 /input/purchases.txt
```

Now, run the pyspark process

```bash
(cd cassandra-spark-docker/examples && task build-python && task run-python)
```

You can verify using the `SELECT` command to see the populated table.

```bash
(cd cassandra-spark-docker && task cqlsh)
```

```sql
USE cleaned_data;
SELECT * FROM sales_analytics;
```

### Explore the data

Copy the `.env.example`

```bash
(cd my-explorer && cp .env.example .env.local)
```

Install the dependencies

```bash
(cd my-explorer && yarn install)
```

Run the Next.JS application

```bash
(cd my-explorer && yarn dev)
```

## Clean up

To clean up the services, you can run the following commands:

- Stop the `spark` and `cassandra` cluster

```bash
(cd cassandra-spark-docker && task down)
```

- Stop the `hadoop` cluster

```bash
(cd docker-hadoop && make down)
```

Note that this does not remove the data stored in the volumes. You can remove the volumes by substituting the `down` command with `delete`.

```bash
(cd docker-hadoop && make delete)
(cd cassandra-spark-docker && task delete)
```

## Resources

- <https://stackoverflow.com/questions/35762459/add-jar-to-standalone-pyspark>
- <https://anant.us/blog/modern-business/data-operations-with-spark-and-cassandra/>
