import { useState, useEffect } from "react";
import { useGame }  from "../../context/GameContext";
import { listStudents, addStudent, removeStudent, updateStudent } from "../../lib/admin";

const GRADES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
function gradeTabLabel(g) { return g === 0 ? "K" : `Grade ${g}`; }
function gradeName(g) { return g === 0 ? "Kindergarten" : `grade ${g}`; }

export default function AdminScreen() {
  const { goToMenu } = useGame();

  const [students,    setStudents]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [activeGrade, setActiveGrade] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmId,   setConfirmId]   = useState(null);
  const [statusMsg,   setStatusMsg]   = useState("");

  // Add-form state
  const [addName,   setAddName]   = useState("");
  const [addGrade,  setAddGrade]  = useState(1);
  const [addEmail,  setAddEmail]  = useState("@zenithacademy.org");
  const [addSaving, setAddSaving] = useState(false);
  const [addError,  setAddError]  = useState("");

  // Edit state
  const [editTarget,  setEditTarget]  = useState(null); // full student object
  const [editName,    setEditName]    = useState("");
  const [editEmail,   setEditEmail]   = useState("");
  const [editPw,      setEditPw]      = useState("");
  const [editSaving,  setEditSaving]  = useState(false);
  const [editError,   setEditError]   = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const all = await listStudents();
      setStudents(all);
    } catch { setStatusMsg("Could not load students."); }
    finally { setLoading(false); }
  }

  const gradeStudents = students.filter((s) => s.grade === activeGrade);

  async function handleAdd(e) {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) { setAddError("Name and email are required."); return; }
    setAddSaving(true); setAddError("");
    try {
      const gradeAdded = addGrade;
      const s = await addStudent(addName.trim(), gradeAdded, addEmail.trim().toLowerCase());
      setStudents((prev) => [...prev, s]);
      setActiveGrade(gradeAdded);
      setAddName(""); setAddEmail("@zenithacademy.org");
      setShowAddForm(false);
      flash(`✓ ${s.displayName} added to ${gradeName(gradeAdded)}`);
    } catch (err) {
      setAddError(err.message ?? "Could not add student.");
    } finally { setAddSaving(false); }
  }

  function openEdit(s) {
    setEditTarget(s);
    setEditName(s.displayName);
    setEditEmail(s.username);
    setEditPw("");
    setEditError("");
  }

  async function handleEdit(e) {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) { setEditError("Name and email are required."); return; }
    setEditSaving(true); setEditError("");
    try {
      const name  = editName.trim();
      const email = editEmail.trim().toLowerCase();
      const pw    = editPw.trim() || null;
      await updateStudent(editTarget.id, editTarget.grade, name, email, pw);
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editTarget.id ? { ...s, displayName: name, username: email } : s
        )
      );
      flash(`✓ ${name} updated`);
      setEditTarget(null);
    } catch (err) {
      setEditError(err.message ?? "Could not save changes.");
    } finally { setEditSaving(false); }
  }

  async function handleRemove(student) {
    setConfirmId(null);
    try {
      await removeStudent(student.id, student.grade);
      setStudents((prev) => prev.filter((s) => s.id !== student.id));
      flash(`✓ ${student.displayName} removed`);
    } catch { flash("Could not remove student.", true); }
  }

  function flash(msg) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3000);
  }

  return (
    <div className="admin-screen">
      {/* Header */}
      <div className="admin-header">
        <button className="lb-back-btn" onClick={goToMenu}>← Menu</button>
        <h2 className="admin-title">⚙️ Admin Panel</h2>
        <button className="admin-add-btn" onClick={() => { setAddGrade(activeGrade); setShowAddForm(true); setAddError(""); }}>
          + Add to {gradeTabLabel(activeGrade)}
        </button>
      </div>

      {statusMsg && (
        <div className={`admin-flash${statusMsg.startsWith("Could") ? " error" : ""}`}>
          {statusMsg}
        </div>
      )}

      {/* Grade tabs */}
      <div className="lb-tabs">
        {GRADES.map((g) => (
          <button
            key={g}
            className={`lb-tab${activeGrade === g ? " active" : ""}`}
            onClick={() => setActiveGrade(g)}
          >
            <span className="lb-tab-label">{gradeTabLabel(g)}</span>
            <span className="admin-grade-count">
              {students.filter((s) => s.grade === g).length}
            </span>
          </button>
        ))}
      </div>

      {/* Student list */}
      <div className="admin-list-wrap">
        {loading ? (
          <div className="lb-loading"><div className="loading-spinner" /><p>Loading…</p></div>
        ) : gradeStudents.length === 0 ? (
          <div className="lb-empty">
            <div className="lb-empty-icon">📭</div>
            <p>No students in {gradeName(activeGrade)}.</p>
          </div>
        ) : (
          <div className="admin-list">
            {gradeStudents.map((s) => (
              <div key={s.id} className="admin-row">
                <div className="admin-student-info">
                  <span className="admin-student-name">{s.displayName}</span>
                  <span className="admin-student-email">{s.username}</span>
                </div>
                <div className="admin-row-actions">
                  <button
                    className="admin-edit-btn"
                    onClick={() => openEdit(s)}
                    title="Edit student"
                  >✏️</button>
                  <button
                    className="admin-remove-btn"
                    onClick={() => setConfirmId(s.id)}
                    title="Remove student"
                  >🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add student modal */}
      {showAddForm && (
        <div className="admin-modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Add New Student</h3>
            <form onSubmit={handleAdd} className="admin-form">
              <label className="login-label">Full Name</label>
              <input
                className="login-input"
                placeholder="First Last"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                disabled={addSaving}
              />
              <label className="login-label">Grade</label>
              <select
                className="login-input admin-select"
                value={addGrade}
                onChange={(e) => setAddGrade(Number(e.target.value))}
                disabled={addSaving}
              >
                {GRADES.map((g) => <option key={g} value={g}>{gradeTabLabel(g)}</option>)}
              </select>
              <label className="login-label">School Email</label>
              <input
                className="login-input"
                placeholder="xxxxx@zenithacademy.org"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                disabled={addSaving}
              />
              {addError && <p className="login-error">{addError}</p>}
              <div className="admin-modal-btns">
                <button type="button" className="admin-cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="login-submit-btn" disabled={addSaving}>
                  {addSaving ? "Saving…" : "Add Student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit student modal */}
      {editTarget && (
        <div className="admin-modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Edit Student</h3>
            <form onSubmit={handleEdit} className="admin-form">
              <label className="login-label">Full Name</label>
              <input
                className="login-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={editSaving}
              />
              <label className="login-label">School Email</label>
              <input
                className="login-input"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                disabled={editSaving}
              />
              <label className="login-label">New Password <span className="admin-optional">(leave blank to keep current)</span></label>
              <input
                className="login-input"
                placeholder="New password"
                value={editPw}
                onChange={(e) => setEditPw(e.target.value)}
                disabled={editSaving}
              />
              {editError && <p className="login-error">{editError}</p>}
              <div className="admin-modal-btns">
                <button type="button" className="admin-cancel-btn" onClick={() => setEditTarget(null)}>Cancel</button>
                <button type="submit" className="login-submit-btn" disabled={editSaving}>
                  {editSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm remove modal */}
      {confirmId !== null && (() => {
        const s = students.find((x) => x.id === confirmId);
        return (
          <div className="admin-modal-overlay" onClick={() => setConfirmId(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="admin-modal-title">Remove Student?</h3>
              <p className="admin-confirm-text">
                This will permanently delete <strong>{s?.displayName}</strong> and all their scores.
              </p>
              <div className="admin-modal-btns">
                <button className="admin-cancel-btn" onClick={() => setConfirmId(null)}>Cancel</button>
                <button className="admin-danger-btn" onClick={() => handleRemove(s)}>Remove</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
