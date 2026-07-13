#!/bin/bash
echo "Testing send-otp..."
curl -s -X POST -H 'Content-Type: application/json' -d '{"email": "test_verify@example.com"}' https://femvnconxoefpctiptkj.supabase.co/functions/v1/server/make-server-fc8eb847/send-otp
echo -e "\nTesting verify-otp with dummy code..."
curl -s -X POST -H 'Content-Type: application/json' -d '{"email": "test_verify@example.com", "otp": "000000"}' https://femvnconxoefpctiptkj.supabase.co/functions/v1/server/make-server-fc8eb847/verify-otp
echo ""
