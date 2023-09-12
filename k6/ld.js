// k6 run script.js
import http from "k6/http";
import { check, sleep } from "k6";
export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: "constant-arrival-rate",
      rate: 40,
      timeUnit: "1s",
      duration: "20s",
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
	insecureSkipTLSVerify: true,
};
// test HTTP
export default function () {
  const res = http.get("https://CanChuLB-c-522163105.ap-northeast-1.elb.amazonaws.com/api/1.0/posts/search", {
    headers: {
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IlRFU1Q3OTQyMDUuOTM5MDU2OTY4QHRlc3QuY29tIiwiaWQiOjIsImlhdCI6MTY5MTY1NjE5NSwiZXhwIjoxNjkxNzQyNTk1fQ.bHv6iP1UPUQR9xKgEQPtNNYvetU3jffF38BU1GssiJ4",
    },
  });
  check(res, { "status was 200": (r) => r.status == 200 });
  sleep(1);
}

