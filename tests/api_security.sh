#!/bin/bash

echo "Starting API security checks."

echo "  Can create user:"
curl -s -o /dev/null \
	-w "      Response: %{http_code}\n" \
	-X POST http://localhost:3000/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"email":"me@example.com","password":"securepass123"}'

echo ""
echo "  Broken Object Level Authorization:"

RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"me@example.com","password":"securepass123"}')
ID=$(echo "$RESPONSE" | jq ".user.id")
TOKEN=$(echo "$RESPONSE" | jq ".accessToken")
REFRESH=$(echo "$RESPONSE" | jq ".refreshToken")

sleep 1

echo "    Creating another user"
curl -s -X POST http://localhost:3000/api/auth/register \
	-H "Content-Type: application/json" \
	-d '{"email":"you@example.com","password":"securepass123"}'

OTHER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"you@example.com","password":"securepass123"}')
O_ID=$(echo "$OTHER_RESPONSE" | jq ".user.id")

sleep 3

echo "    Trying to access user data"

sleep 5

check_if_BOLA_failed() {
	HTTP_CODE=$1
	if ((HTTP_CODE > 199 && HTTP_CODE < 300)); then
		echo "      Failed ($HTTP_CODE), shouldn't be able to access user data"
	else
		echo "      Success ($HTTP_CODE), couldn't access user data"
	fi
}

STATUS=$(curl -s -o /dev/null \
	-w "%{http_code}" \
	-X GET http://localhost:3000/api/users/$ID \
	-H "Authorization: Bearer $TOKEN")
check_if_BOLA_failed $STATUS

sleep 0.5

STATUS=$(curl -s -o /dev/null \
	-w "%{http_code}" \
	-X GET http://localhost:3000/api/users/$O_ID \
	-H "Authorization: Bearer $TOKEN")
check_if_BOLA_failed $STATUS

sleep 0.5

curl -s -o /dev/null \
	-w "      through /users/me path: %{http_code}\n" \
	-X GET http://localhost:3000/api/users/me \
	-H "Authorization: Bearer $TOKEN"

echo ""
echo "Sleeping for 10 seconds"
sleep 10

echo ""
echo "  SQL injection:"
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"'"'"' OR 1=1--","password":"incorrectpass1"}'
sleep 10

echo "  Ddos test:"
for i in {1..10}
do
	curl -s -o /dev/null \
	-w "    Request ($i) response: %{http_code}\n" \
	-X POST http://localhost:3000/api/auth/login \
	-H "Content-Type: application/json" \
	-d '{"email":"me@example.com","password":"securepass123"}'
done
