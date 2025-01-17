import json
import logging
import os
import sys

import colorlog
import pyhdfs
import six
from kafka import KafkaConsumer

if sys.version_info >= (3, 12, 0):
    sys.modules["kafka.vendor.six.moves"] = six.moves

KAFKA_BROKER = os.getenv("KAFKA_BROKER", "localhost:9092")
HDFS_NAMENODE = os.getenv("HDFS_NAMENODE", "namenode:9870")  # needs /etc/hosts entry

# Configure logger
handler = colorlog.StreamHandler()
handler.setFormatter(
    colorlog.ColoredFormatter(
        "%(log_color)s%(asctime)s - %(levelname)s - %(name)s - %(message)s",
        log_colors={
            "DEBUG": "cyan",
            "INFO": "green",
            "WARNING": "yellow",
            "ERROR": "red",
            "CRITICAL": "red,bg_white",
        },
    )
)
logger = colorlog.getLogger("consumer")
logger.addHandler(handler)
logger.setLevel(logging.DEBUG)

# Kafka consumer setup
try:
    consumer = KafkaConsumer(
        "ecommerce_transactions",
        bootstrap_servers=[KAFKA_BROKER],
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        group_id="hdfs-consumer-group",
    )
    logger.info("Connected to Kafka broker at %s", KAFKA_BROKER)
except Exception as e:
    logger.error("Failed to connect to Kafka broker at %s: %s", KAFKA_BROKER, e)
    sys.exit(1)

# HDFS client setup with increased timeout
try:
    hdfs_client = pyhdfs.HdfsClient(hosts=HDFS_NAMENODE, user_name="root")
    # Perform a simple operation to check the connection
    hdfs_client.listdir("/")
    logger.info("Connected to HDFS namenode at %s", HDFS_NAMENODE)
except Exception as e:
    logger.error("Failed to connect to HDFS namenode at %s: %s", HDFS_NAMENODE, e)
    sys.exit(1)

# Read messages from Kafka and write to HDFS
logger.info("Starting to consume messages from Kafka topic 'ecommerce_transactions'")
for message in consumer:
    try:
        record = json.loads(message.value.decode("utf-8"))
        logger.debug("Received message: %s", record)
        hdfs_path = f"/data/ecommerce_transactions/{record['transactionId']}.json"
        logger.debug("Writing message to HDFS path: %s", hdfs_path)
        hdfs_client.create(
            hdfs_path, json.dumps(record).encode("utf-8"), overwrite=True
        )
        logger.info("Successfully written message to HDFS path: %s", hdfs_path)
    except Exception as e:
        logger.error("Failed to process message: %s", e)
