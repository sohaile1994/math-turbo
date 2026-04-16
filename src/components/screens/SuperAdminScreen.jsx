import { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { listTeachers, addTeacher, removeTeacher, updateTeacher } from "../../lib/admin";

export default function SuperAdminScreen() {
  const { goToMenu } = useGame();

  const [teachers,    setTeachers]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [statusMsg,   setStatusMsg]   = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [confirmId,   setConfirmId]   = useState(null);

  // Add-form state
  const [addName,   setAddName]   = useState("");
  const [addEmail,  setAddEmail]  = useState("");
  const [addSaving, setAddSaving] = useState(false);
  const [addError,  setAddError]  = useState("");

  // Edit state
  const [editTarget, setEditTarget] = useState(null);
  const [editName,   setEditName]   = useState("");
  const [editEmail,  setEditEmail]  = useState("");
  const [editPw,     setEditPw]     = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError,  setEditError]  = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      setTeachers(await listTeachers());
    } catch { setStatusMsg("Could not load teachers."); }
    finally { setLoading(false); }
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) { setAddError("Name and email are required."); return; }
    setAddSaving(true); setAddError("");
    try {
      const t = await addTeacher(addName.trim(), addEmail.trim().toLowerCase());
      setTeachers((prev) => [...prev, t].sort((a, b) => a.displayName.localeCompare(b.displayName)));
      setAddName(""); setAddEmail("");
      setShowAddForm(false);
      flash(`✓ ${t.displayName} added`);
    } catch (err) {
      setAddError(err.message ?? "Could not add teacher.");
    } finally { setAddSaving(false); }
  }

  function openEdit(t) {
    setEditTarget(t);
    setEditName(t.displayName);
    setEditEmail(t.username);
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
      await updateTeacher(editTarget.id, name, email, pw);
      setTeachers((prev) =>
        prev.map((t) => t.id === editTarget.id ? { ...t, displayName: name, username: email } : t)
      );
      flash(`✓ ${name} updated`);
      setEditTarget(null);
    } catch (err) {
      setEditError(err.message ?? "Could not save changes.");
    } finally { setEditSaving(false); }
  }

  async function handleRemove(teacher) {
    setConfirmId(null);
    try {
      await removeTeacher(teacher.id);
      setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
      flash(`✓ ${teacher.displayName} removed`);
    } catch { flash("Could not remove teacher.", true); }
  }

  function flash(msg, isError = false) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(""), 3000);
  }

  return (
    <div className="admin-screen">
      {/* Header */}
      <div className="admin-header superadmin-header">
        <button className="lb-back-btn" onClick={goToMenu}>← Menu</button>
        <h2 className="admin-title">👑 Administrator</h2>
        <button className="admin-add-btn" onClick={() => { setShowAddForm(true); setAddError(""); }}>
          + Add Teacher
        </button>
      </div>

      {statusMsg && (
        <div className={`admin-flash${statusMsg.startsWith("Could") ? " error" : ""}`}>
          {statusMsg}
        </div>
      )}

      {/* Teacher list */}
      <div className="admin-list-wrap">
        {loading ? (
          <div className="lb-loading"><div className="loading-spinner" /><p>Loading…</p></div>
        ) : teachers.length === 0 ? (
          <div className="lb-empty">
            <div className="lb-empty-icon">📭</div>
            <p>No teachers yet.</p>
          </div>
        ) : (
          <div className="admin-list">
            {teachers.map((t) => (
              <div key={t.id} className="admin-row">
                <div className="admin-student-info">
                  <span className="admin-student-name">{t.displayName}</span>
                  <span className="admin-student-email">{t.username}</span>
                </div>
                <div className="admin-row-actions">
                  <button
                    className="admin-edit-btn"
                    onClick={() => openEdit(t)}
                    title="Edit teacher"
                  >✏️</button>
                  <button
                    className="admin-remove-btn"
                    onClick={() => setConfirmId(t.id)}
                    title="Remove teacher"
                  >🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add teacher modal */}
      {showAddForm && (
        <div className="admin-modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Add New Teacher</h3>
            <form onSubmit={handleAdd} className="admin-form">
              <label className="login-label">Full Name</label>
              <input
                className="login-input"
                placeholder="First Last"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                disabled={addSaving}
              />
              <label className="login-label">School Email</label>
              <input
                className="login-input"
                placeholder="name@zenithacademy.org"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                disabled={addSaving}
              />
              {addError && <p className="login-error">{addError}</p>}
              <div className="admin-modal-btns">
                <button type="button" className="admin-cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="login-submit-btn" disabled={addSaving}>
                  {addSaving ? "Saving…" : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit teacher modal */}
      {editTarget && (
        <div className="admin-modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Edit Teacher</h3>
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
        const t = teachers.find((x) => x.id === confirmId);
        return (
          <div className="admin-modal-overlay" onClick={() => setConfirmId(null)}>
            <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="admin-modal-title">Remove Teacher?</h3>
              <p className="admin-confirm-text">
                This will permanently delete <strong>{t?.displayName}</strong>.
              </p>
              <div className="admin-modal-btns">
                <button className="admin-cancel-btn" onClick={() => setConfirmId(null)}>Cancel</button>
                <button className="admin-danger-btn" onClick={() => handleRemove(t)}>Remove</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
