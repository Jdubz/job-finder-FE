#!/bin/bash

# Safe Test Runner Script
# Runs tests in smaller batches to prevent memory issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Running tests safely to prevent memory issues...${NC}"

# Test file groups (smaller batches)
UNIT_TESTS=(
  "src/lib/__tests__/utils.test.ts"
  "src/components/ui/__tests__/button.test.ts"
  "src/components/auth/__tests__/AuthIcon.test.ts"
  "src/components/auth/__tests__/AuthModal.test.ts"
  "src/components/layout/__tests__/MainLayout.test.ts"
  "src/components/layout/__tests__/Navigation.test.ts"
  "src/hooks/__tests__/usePersonalInfo.test.ts"
  "src/__tests__/App.test.ts"
  "src/__tests__/components/GenerationProgress.test.ts"
  "src/__tests__/components/DocumentHistoryList.test.ts"
)

INTEGRATION_TESTS=(
  "src/__tests__/pages/DocumentBuilderPage.test.ts"
  "src/__tests__/integration/document-generation-flow.test.ts"
)

# Function to run a single test file
run_single_test() {
  local test_file=$1
  echo -e "${YELLOW}Running: ${test_file}${NC}"
  
  if NODE_OPTIONS='--max-old-space-size=4096' npx vitest run "$test_file" --no-coverage --reporter=verbose --no-isolate; then
    echo -e "${GREEN}✅ ${test_file} passed${NC}"
    return 0
  else
    echo -e "${RED}❌ ${test_file} failed${NC}"
    return 1
  fi
}

# Function to run unit tests
run_unit_tests() {
  echo -e "${YELLOW}📦 Running unit tests...${NC}"
  local failed_tests=()
  
  for test_file in "${UNIT_TESTS[@]}"; do
    if ! run_single_test "$test_file"; then
      failed_tests+=("$test_file")
    fi
    # Small delay between tests to allow memory cleanup
    sleep 1
  done
  
  if [ ${#failed_tests[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All unit tests passed!${NC}"
    return 0
  else
    echo -e "${RED}❌ Failed unit tests:${NC}"
    printf '%s\n' "${failed_tests[@]}"
    return 1
  fi
}

# Function to run integration tests
run_integration_tests() {
  echo -e "${YELLOW}🔗 Running integration tests...${NC}"
  local failed_tests=()
  
  for test_file in "${INTEGRATION_TESTS[@]}"; do
    if ! run_single_test "$test_file"; then
      failed_tests+=("$test_file")
    fi
    # Longer delay for integration tests
    sleep 2
  done
  
  if [ ${#failed_tests[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All integration tests passed!${NC}"
    return 0
  else
    echo -e "${RED}❌ Failed integration tests:${NC}"
    printf '%s\n' "${failed_tests[@]}"
    return 1
  fi
}

# Main execution
case "${1:-all}" in
  "unit")
    run_unit_tests
    ;;
  "integration")
    run_integration_tests
    ;;
  "all")
    echo -e "${YELLOW}🚀 Running all tests in safe batches...${NC}"
    if run_unit_tests && run_integration_tests; then
      echo -e "${GREEN}🎉 All tests passed!${NC}"
      exit 0
    else
      echo -e "${RED}💥 Some tests failed!${NC}"
      exit 1
    fi
    ;;
  *)
    echo "Usage: $0 [unit|integration|all]"
    echo "  unit       - Run only unit tests"
    echo "  integration - Run only integration tests"
    echo "  all        - Run all tests (default)"
    exit 1
    ;;
esac
