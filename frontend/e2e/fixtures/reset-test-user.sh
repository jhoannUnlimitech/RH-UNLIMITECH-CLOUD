#!/bin/bash
# Reset the e2e test user: delete and re-create
# Run this AFTER restarting the backend to clear rate limits

API="http://localhost:9050/api/v1"
EMAIL="greatly-hide@emxeecta.mailosaur.net"
PASSWORD="Pass2014!"

echo "=== Step 1: Login as admin ==="
ADMIN_RESPONSE=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@unlimitech.cloud","password":"Pass2014!"}')

echo "$ADMIN_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print('Status:', d.get('status','FAIL')); print('Token:', d.get('data',{}).get('debug',{}).get('token','N/A')[:50]+'...')" 2>/dev/null

TOKEN=$(echo "$ADMIN_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['debug']['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "❌ Admin login failed. Is backend running? Rate limited?"
  echo "Response: $ADMIN_RESPONSE"
  exit 1
fi

echo ""
echo "=== Step 2: Find and delete existing test user ==="
# Search employees by email
EMPLOYEES=$(curl -s "$API/employees?search=$EMAIL" \
  -H "Authorization: Bearer $TOKEN")

USER_ID=$(echo "$EMPLOYEES" | python3 -c "
import sys,json
data = json.load(sys.stdin)
employees = data.get('data',{}).get('employees', data.get('data',[]))
for e in employees:
    if e.get('email') == '$EMAIL':
        print(e.get('_id', e.get('id','')))
        break
" 2>/dev/null)

if [ -n "$USER_ID" ]; then
  echo "Found user: $USER_ID — deleting..."
  DELETE_RES=$(curl -s -X DELETE "$API/employees/$USER_ID" \
    -H "Authorization: Bearer $TOKEN")
  echo "Delete response: $DELETE_RES"
else
  echo "User not found (already deleted or never created)"
fi

echo ""
echo "=== Step 3: Get developer role ID ==="
ROLES=$(curl -s "$API/roles" -H "Authorization: Bearer $TOKEN")
ROLE_ID=$(echo "$ROLES" | python3 -c "
import sys,json
data = json.load(sys.stdin)
roles = data.get('data',{}).get('roles', data.get('data',[]))
for r in roles:
    if r.get('name') == 'DEVELOPER':
        print(r.get('_id', r.get('id','')))
        break
" 2>/dev/null)
echo "Developer role ID: $ROLE_ID"

echo ""
echo "=== Step 4: Get division ID ==="
DIVISIONS=$(curl -s "$API/divisions" -H "Authorization: Bearer $TOKEN")
DIV_ID=$(echo "$DIVISIONS" | python3 -c "
import sys,json
data = json.load(sys.stdin)
divs = data.get('data',{}).get('divisions', data.get('data',[]))
if divs:
    print(divs[0].get('_id', divs[0].get('id','')))
" 2>/dev/null)
echo "Division ID: $DIV_ID"

echo ""
echo "=== Step 5: Register new test user ==="
REGISTER_RES=$(curl -s -X POST "$API/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"E2E Test Developer\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"role\": \"$ROLE_ID\",
    \"division\": \"$DIV_ID\",
    \"birthDate\": \"1995-08-22\",
    \"nationalId\": \"9999888877\",
    \"phone\": \"+573001234567\",
    \"nationality\": \"Colombia\"
  }")
echo "Register response status: $(echo "$REGISTER_RES" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','UNKNOWN'))" 2>/dev/null)"

echo ""
echo "=== Step 6: Verify login with new user ==="
LOGIN_RES=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
echo "Login response: $(echo "$LOGIN_RES" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('status','FAIL'), '-', d.get('message',''))" 2>/dev/null)"

echo ""
echo "=== Done! ==="
echo "📧 Email:    $EMAIL"
echo "🔑 Password: $PASSWORD"
