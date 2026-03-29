#!/usr/bin/env python

import os

files = os.listdir("./plugins/litapp/blog/tiddlers")
mapping = list([ (f,f.replace('$__','').replace('_','/')) for f in files])
for f, path in mapping:
    print("==", f, path)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    os.rename("plugins/litapp/blog/tiddlers/"+f, path)
