#!/usr/bin/env python
"""
bigtrees web app unit tests

"""
from __future__ import division
import os
import sys
import platform
from flask import request
if platform.python_version() < "2.7":
    unittest = __import__("unittest2")
else:
    import unittest
from flask.ext.testing import TestCase

HERE = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(HERE, os.pardir))

from app import app

class TestApp(TestCase):

    def create_app(self):
        return app

    def test_route_index_get(self):
        """Route: HTTP GET /"""
        with self.app.test_client() as client:
            response = client.get('/')
            self.assertEqual(response.status_code, 200)

    def test_route_index_post_match(self):
        """Route: HTTP POST / (match)"""
        with self.app.test_client() as client:
            user_input = {
                "species": "QUKE",
                "quantity": 73.5,
            }
            response = client.post('/', data=user_input)
            self.assertEqual(response.status_code, 200)
            self.assert_template_used("index.html")
            self.assert_context("lookup", "4.82057")

    def test_route_index_post_nomatch(self):
        """Route: HTTP POST / (no match)"""
        with self.app.test_client() as client:
            # Invalid species name
            user_input = {
                "species": "FAKE",
                "quantity": 73.5,
            }
            response = client.post('/', data=user_input)
            self.assertEqual(response.status_code, 200)
            self.assert_template_used("index.html")
            self.assert_context("lookup", "No match found")
            # Invalid quantity
            user_input = {
                "species": "QUKE",
                "quantity": 10000.1,
            }
            response = client.post('/', data=user_input)
            self.assertEqual(response.status_code, 200)
            self.assert_template_used("index.html")
            self.assert_context("lookup", "No match found")


if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestApp)
    unittest.TextTestRunner(verbosity=2).run(suite)
