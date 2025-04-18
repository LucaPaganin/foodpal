import streamlit as st
import json
import os

JSON_PATH = "copilot.json"
STATUS_OPTIONS = ["todo", "to_be_tested", "tested"]

def load_tasks():
    if not os.path.exists(JSON_PATH):
        return []
    with open(JSON_PATH, "r") as f:
        data = json.load(f)
    return data.get("tasks", [])

def save_tasks(tasks):
    if not os.path.exists(JSON_PATH):
        data = {}
    else:
        with open(JSON_PATH, "r") as f:
            data = json.load(f)
    data["tasks"] = tasks
    with open(JSON_PATH, "w") as f:
        json.dump(data, f, indent=2)

def main():
    st.set_page_config(page_title="FoodPal Progress Tracker", layout="wide")
    st.title("FoodPal Progress Tracker")

    # Load tasks from JSON
    if "tasks" not in st.session_state:
        st.session_state.tasks = load_tasks()

    tasks = st.session_state.tasks

    # Multiselect to filter by overall status
    filter_statuses = st.multiselect(
        "Filter tasks by overall status",
        STATUS_OPTIONS,
        default=STATUS_OPTIONS
    )

    def render_task(task, idx):
        with st.expander(f'{task["name"]}', expanded=True):
            # Overall status selectbox
            overall_status = st.selectbox(
                "Overall Status",
                STATUS_OPTIONS,
                index=STATUS_OPTIONS.index(task.get("overall_status", task.get("status", STATUS_OPTIONS[0])))
                    if task.get("overall_status", task.get("status", STATUS_OPTIONS[0])) in STATUS_OPTIONS else 0,
                key=f"task_overall_status_{idx}"
            )
            task["overall_status"] = overall_status

            # (Optional) legacy: update "status" for backward compatibility
            task["status"] = overall_status

            # Subtasks
            for j, sub in enumerate(task.get("subtasks", [])):
                sub_status = st.selectbox(
                    f'↳ {sub["name"]} status',
                    STATUS_OPTIONS,
                    index=STATUS_OPTIONS.index(sub["status"]) if sub["status"] in STATUS_OPTIONS else 0,
                    key=f"subtask_status_{idx}_{j}"
                )
                sub["status"] = sub_status

    st.subheader("Tasks")
    # Filter tasks by selected overall statuses
    filtered_tasks = [t for t in tasks if t.get("overall_status", t.get("status")) in filter_statuses]

    for i, task in enumerate(filtered_tasks):
        render_task(task, i)

    if st.button("Save Changes"):
        save_tasks(tasks)
        st.success("Progress saved to copilot.json")

if __name__ == "__main__":
    main()