import { useState, useEffect } from "react";
import { useGame } from "../../context/GameContext";
import { listTeachers, addTeacher, removeTeacher, resetTeacherPassword } from "../../lib/admin";

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

  // Reset-password state
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPw,     setResetPw]     = useState("");
  const [resetSaving, setResetSaving] = useState(false);

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

  async function handleRemove(teacher) {
    setConfirmId(null);
    try {
      await removeTeacher(teacher.id);
      setTeachers((prev) => prev.filter((t) => t.id !== teacher.id));
      flash(`✓ ${teacher.displayName} removed`);
    } catch { flash("Could not remove teacher.", true); }
  }

  async function handleResetPw(e) {
    e.preventDefault();
    if (!resetPw.trim()) return;
    setResetSaving(true);
    try {
      await resetTeacherPassword(resetTarget.id, resetPw.trim());
      flash(`✓ Password reset for ${resetTarget.displayName}`);
      setResetTarget(null); setResetPw("");
    } catch { flash("Could not reset password.", true); }
    finally { setResetSaving(false); }
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
                    className="admin-reset-btn"
                    onClick={() => { setResetTarget(t); setResetPw(""); }}
                    title="Reset password"
                  >🔑</button>
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

      {/* Reset password modal */}
      {resetTarget && (
        <div className="admin-modal-overlay" onClick={() => setResetTarget(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">Reset Password</h3>
            <p className="admin-confirm-text">Set new password for <strong>{resetTarget.displayName}</strong></p>
            <form onSubmit={handleResetPw} className="admin-form">
              <input
                className="login-input"
                placeholder="New password"
                value={resetPw}
                onChange={(e) => setResetPw(e.target.value)}
                disabled={resetSaving}
              />
              <div className="admin-modal-btns">
                <button type="button" className="admin-cancel-btn" onClick={() => setResetTarget(null)}>Cancel</button>
                <button type="submit" className="login-submit-btn" disabled={resetSaving || !resetPw.trim()}>
                  {resetSaving ? "Saving…" : "Reset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
