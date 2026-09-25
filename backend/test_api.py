"""
Comprehensive API test suite for the Fireflies Clone.
Run: python test_api.py
"""
import json
import sys
import urllib.request
import urllib.error

BASE = "http://localhost:8000"
PASS = 0
FAIL = 0
ISSUES = []

def req(method, path, body=None, expect_status=None):
    url = BASE + path
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as resp:
            status = resp.status
            resp_body = json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        status = e.code
        try:
            resp_body = json.loads(e.read().decode())
        except Exception:
            resp_body = {}
    if expect_status and status != expect_status:
        return status, resp_body, False
    return status, resp_body, True

def check(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        print(f"  [PASS] {name}")
        PASS += 1
    else:
        print(f"  [FAIL] {name} {detail}")
        FAIL += 1
        ISSUES.append(f"{name}: {detail}")

print("\n" + "="*60)
print("SECTION 1: GET /api/meetings")
print("="*60)
status, meetings, _ = req("GET", "/api/meetings")
check("Status 200", status == 200, f"got {status}")
check("Returns list", isinstance(meetings, list))
check("Has 8 seeded meetings", len(meetings) >= 8, f"got {len(meetings)}")

m0 = meetings[0] if meetings else {}
check("Has id field", "id" in m0)
check("Has title field", "title" in m0)
check("Has date field", "date" in m0)
check("Has duration field", "duration" in m0)
check("Has participants field", "participants" in m0)
check("Participants is list", isinstance(m0.get("participants", None), list))
check("Has summary_preview", "summary_preview" in m0)

print("\n" + "="*60)
print("SECTION 2: Meetings Filter/Sort/Search")
print("="*60)
_, by_search, _ = req("GET", "/api/meetings?search=engineering")
check("Search returns results", len(by_search) >= 1, f"got {len(by_search)}")

_, by_search_upper, _ = req("GET", "/api/meetings?search=ENGINEERING")
check("Search is case-insensitive", len(by_search_upper) >= 1)

_, sorted_recent, _ = req("GET", "/api/meetings?sort=recent")
_, sorted_oldest, _ = req("GET", "/api/meetings?sort=oldest")
check("Sort recent returns list", isinstance(sorted_recent, list))
check("Sort oldest returns list", isinstance(sorted_oldest, list))
if len(sorted_recent) >= 2 and len(sorted_oldest) >= 2:
    check("Recent sort order correct", sorted_recent[0]["date"] >= sorted_oldest[-1]["date"])

_, date_filtered, _ = req("GET", "/api/meetings?date_from=2026-09-01&date_to=2026-09-30")
check("Date filter returns results", len(date_filtered) >= 1, f"got {len(date_filtered)}")

_, empty_search, _ = req("GET", "/api/meetings?search=xyznonexistent999")
check("Empty search returns []", len(empty_search) == 0, f"got {len(empty_search)}")

print("\n" + "="*60)
print("SECTION 3: GET /api/meetings/{id}")
print("="*60)
first_id = meetings[0]["id"] if meetings else None
if first_id:
    status, detail, _ = req("GET", f"/api/meetings/{first_id}")
    check("Status 200", status == 200)
    check("Has transcript_lines", "transcript_lines" in detail)
    check("Has summary", "summary" in detail)
    check("Has action_items", "action_items" in detail)
    lines = detail.get("transcript_lines", [])
    check("Transcript has lines", len(lines) > 0, f"got {len(lines)}")
    if lines:
        l0 = lines[0]
        check("Line has speaker", "speaker" in l0 and l0["speaker"])
        check("Line has text", "text" in l0 and l0["text"])
        check("Line has start_time", "start_time" in l0)
        check("Line has end_time", "end_time" in l0)
        check("Line has sequence", "sequence" in l0)
        check("start_time < end_time", l0["start_time"] < l0["end_time"])
        # Check ordering
        ordered = all(lines[i]["sequence"] <= lines[i+1]["sequence"] for i in range(len(lines)-1))
        check("Lines are ordered by sequence", ordered)

status_404, body_404, _ = req("GET", "/api/meetings/nonexistent-id-xyz")
check("404 for bad meeting id", status_404 == 404, f"got {status_404}")

print("\n" + "="*60)
print("SECTION 4: POST /api/meetings (Create)")
print("="*60)
new_meeting_payload = {
    "title": "QA Test Meeting",
    "date": "2026-09-25T10:00:00",
    "duration": 1800,
    "participants": ["QA Tester", "Dev Bot"],
    "transcript": [
        {"speaker": "QA Tester", "text": "Starting QA test.", "start_time": 0.0, "end_time": 5.0, "sequence": 0},
        {"speaker": "Dev Bot", "text": "All systems nominal.", "start_time": 6.0, "end_time": 10.0, "sequence": 1},
    ],
    "summary": {
        "overview": "A test meeting for QA purposes.",
        "key_topics": ["QA", "Testing"],
        "notes": ""
    },
    "action_items": [
        {"task": "Verify all endpoints", "assignee": "QA Tester", "completed": False}
    ]
}
status_create, created, _ = req("POST", "/api/meetings", new_meeting_payload)
check("Status 201 on create", status_create == 201, f"got {status_create}")
check("Created has id", "id" in created)
check("Title matches", created.get("title") == "QA Test Meeting")
check("Participants match", created.get("participants") == ["QA Tester", "Dev Bot"])
created_id = created.get("id")

print("\n" + "="*60)
print("SECTION 5: PUT /api/meetings/{id} (Update)")
print("="*60)
if created_id:
    status_upd, updated, _ = req("PUT", f"/api/meetings/{created_id}", {"title": "QA Updated Meeting", "participants": ["QA Tester", "Dev Bot", "Observer"]})
    check("Status 200 on update", status_upd == 200, f"got {status_upd}")
    check("Title updated", updated.get("title") == "QA Updated Meeting")
    check("Participants updated", len(updated.get("participants", [])) == 3)

print("\n" + "="*60)
print("SECTION 6: Transcript Endpoints")
print("="*60)
if first_id:
    status_t, transcript, _ = req("GET", f"/api/meetings/{first_id}/transcript")
    check("GET transcript status 200", status_t == 200)
    check("Transcript is list", isinstance(transcript, list))
    check("Transcript non-empty", len(transcript) > 0)

print("\n" + "="*60)
print("SECTION 7: Summary Endpoints")
print("="*60)
if first_id:
    status_s, summary, _ = req("GET", f"/api/meetings/{first_id}/summary")
    check("GET summary status 200", status_s == 200)
    check("Has overview", "overview" in summary and summary["overview"])
    check("Has key_topics list", isinstance(summary.get("key_topics"), list))
    check("Has notes field", "notes" in summary)

    # Update notes
    status_su, updated_summary, _ = req("PUT", f"/api/meetings/{first_id}/summary", {"notes": "QA test note"})
    check("PUT summary status 200", status_su == 200)
    check("Notes updated", updated_summary.get("notes") == "QA test note")

    # Verify persistence
    _, refetched, _ = req("GET", f"/api/meetings/{first_id}/summary")
    check("Notes persist after update", refetched.get("notes") == "QA test note")

    # Restore
    req("PUT", f"/api/meetings/{first_id}/summary", {"notes": ""})

print("\n" + "="*60)
print("SECTION 8: Action Item Endpoints")
print("="*60)
if first_id:
    status_a, actions, _ = req("GET", f"/api/meetings/{first_id}/actions")
    check("GET actions status 200", status_a == 200)
    check("Actions is list", isinstance(actions, list))
    check("Actions non-empty", len(actions) > 0)

    # Create
    status_ac, new_action, _ = req("POST", f"/api/meetings/{first_id}/actions", {"task": "QA action item", "assignee": "QA"})
    check("POST action status 201", status_ac == 201, f"got {status_ac}")
    check("Action has id", "id" in new_action)
    new_action_id = new_action.get("id")

    # Update (toggle complete)
    if new_action_id:
        status_au, upd_action, _ = req("PUT", f"/api/actions/{new_action_id}", {"completed": True})
        check("PUT action status 200", status_au == 200, f"got {status_au}")
        check("Action marked complete", upd_action.get("completed") == True)

        # Toggle back
        req("PUT", f"/api/actions/{new_action_id}", {"completed": False})

        # Delete
        status_del, _, _ = req("DELETE", f"/api/actions/{new_action_id}")
        check("DELETE action status 204", status_del == 204, f"got {status_del}")

        # Confirm gone
        _, actions_after, _ = req("GET", f"/api/meetings/{first_id}/actions")
        still_exists = any(a["id"] == new_action_id for a in actions_after)
        check("Action deleted from DB", not still_exists)

print("\n" + "="*60)
print("SECTION 9: DELETE /api/meetings/{id}")
print("="*60)
if created_id:
    status_del, _, _ = req("DELETE", f"/api/meetings/{created_id}")
    check("DELETE status 204", status_del == 204, f"got {status_del}")

    # Confirm cascade — meeting gone
    status_gone, _, _ = req("GET", f"/api/meetings/{created_id}")
    check("Meeting 404 after delete", status_gone == 404)

print("\n" + "="*60)
print("SECTION 10: /api/search")
print("="*60)
status_sr, results, _ = req("GET", "/api/search?q=product")
check("Search status 200", status_sr == 200)
check("Search returns results", len(results) > 0, f"got {len(results)}")
if results:
    r0 = results[0]
    check("Result has meeting_id", "meeting_id" in r0)
    check("Result has meeting_title", "meeting_title" in r0)
    check("Result has speaker", "speaker" in r0)
    check("Result has text", "text" in r0)

_, empty_results, _ = req("GET", "/api/search?q=xyznonexistent999zzz")
check("Empty search returns []", len(empty_results) == 0)

_, upper_results, _ = req("GET", "/api/search?q=PRODUCT")
check("Search case-insensitive", len(upper_results) > 0, f"got {len(upper_results)}")

print("\n" + "="*60)
print("SECTION 11: Validation / Error Handling")
print("="*60)
# Missing required field
status_bad, body_bad, _ = req("POST", "/api/meetings", {"date": "2026-01-01", "duration": 60})
check("400/422 for missing title", status_bad in [400, 422], f"got {status_bad}")

# 404 for nonexistent action
status_nf, _, _ = req("PUT", "/api/actions/999999", {"completed": True})
check("404 for nonexistent action", status_nf == 404, f"got {status_nf}")

# 404 for nonexistent summary
status_ns, _, _ = req("GET", "/api/meetings/nonexistent/summary")
check("404 for bad meeting summary", status_ns == 404, f"got {status_ns}")

print("\n" + "="*60)
print(f"RESULTS: {PASS} PASSED  |  {FAIL} FAILED")
print("="*60)
if ISSUES:
    print("\nFailed checks:")
    for issue in ISSUES:
        print(f"  - {issue}")
sys.exit(0 if FAIL == 0 else 1)
