"""MongoDB persistence layer.

Reads MONGO_URI from the environment. If MongoDB is unreachable, the
app keeps running but logs a clear error explaining how to fix it so
the demo flow is never blocked silently.
"""

from __future__ import annotations

import logging
import os
import sys
from typing import Any, Optional

from pymongo import MongoClient
from pymongo.errors import PyMongoError

logger = logging.getLogger("momentum.db")
DEFAULT_URI = "mongodb://localhost:27017/momentum"


class Mongo:
    def __init__(self) -> None:
        self.client: Optional[MongoClient] = None
        self.db = None
        self.enabled = False
        self.error: Optional[str] = None
        uri = os.getenv("MONGO_URI", DEFAULT_URI)
        try:
            client = MongoClient(uri, serverSelectionTimeoutMS=2000)
            client.admin.command("ping")
            default_db = client.get_default_database()
            db_name = default_db.name if default_db is not None else "momentum"
            self.client = client
            self.db = client[db_name]
            self.enabled = True
            logger.info("Connected to MongoDB at %s (db=%s)", uri, db_name)
        except PyMongoError as e:
            self.error = str(e)
            sys.stderr.write(
                "\n[Momentum] Could not connect to MongoDB.\n"
                f"  URI tried: {uri}\n"
                f"  Reason   : {e}\n"
                "  The app will keep running, but schedules will not be persisted.\n"
                "  To enable persistence:\n"
                "    1. Install MongoDB locally (brew install mongodb-community)\n"
                "       and start it (brew services start mongodb-community), OR\n"
                "    2. Provision a free MongoDB Atlas cluster.\n"
                "    3. Copy backend/.env.example to backend/.env and set MONGO_URI.\n\n"
            )

    def save_schedule(self, schedule: dict[str, Any]) -> None:
        if not self.enabled or self.db is None:
            return
        try:
            self.db.schedules.update_one(
                {"id": schedule["id"]},
                {"$set": schedule},
                upsert=True,
            )
        except PyMongoError as e:
            logger.warning("Failed to persist schedule: %s", e)

    def save_inputs(self, payload: dict[str, Any]) -> None:
        if not self.enabled or self.db is None:
            return
        try:
            for ev in payload.get("fixed_events", []):
                self.db.fixed_events.update_one(
                    {"id": ev["id"]}, {"$set": ev}, upsert=True
                )
            for task in payload.get("flex_tasks", []):
                self.db.flex_tasks.update_one(
                    {"id": task["id"]}, {"$set": task}, upsert=True
                )
        except PyMongoError as e:
            logger.warning("Failed to persist inputs: %s", e)


mongo = Mongo()
