VERSION := $(shell head -1 version)


all: dist


clean:
	rm -rf dist


init:
	@mkdir -p dist


dist: init dist/parti-$(VERSION).js


dist/parti-$(VERSION).js: src/parti.js
	cp src/parti.js dist/parti-$(VERSION).js
