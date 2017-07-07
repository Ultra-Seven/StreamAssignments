#!/usr/bin/env python
# encoding: utf-8
import json
import bsddb3 as bsddb
db = bsddb.hashopen('mouse.bdb');
for key in db:
    j = json.loads(db[key+""])
    print j
