"""
HarvestIQ - Automated Test Suite Runner
Runs all unit and integration tests across the backend test suite.
"""

import sys
import os
import unittest

# Ensure backend directory is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

def run_all_tests():
    loader = unittest.TestLoader()
    suite = loader.discover(start_dir=os.path.join(BASE_DIR, "tests"), pattern="test_*.py")
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    if not result.wasSuccessful():
        sys.exit(1)

if __name__ == "__main__":
    run_all_tests()
