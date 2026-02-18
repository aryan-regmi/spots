use tracing;

#[tauri::command]
pub fn debug(msg: String, span_id: String) {
    let span = tracing::debug_span!("{}", span_id);
    span.in_scope(|| tracing::debug!(msg));
}

#[tauri::command]
pub fn trace(msg: String, span_id: String) {
    let span = tracing::trace_span!("{}", span_id);
    span.in_scope(|| tracing::trace!(msg));
}

#[tauri::command]
pub fn info(msg: String, span_id: String) {
    let span = tracing::info_span!("{}", span_id);
    span.in_scope(|| tracing::info!(msg));
}

#[tauri::command]
pub fn warn(msg: String, span_id: String) {
    let span = tracing::warn_span!("{}", span_id);
    span.in_scope(|| tracing::warn!(msg));
}

#[tauri::command]
pub fn error(msg: String, span_id: String) {
    let span = tracing::error_span!("{}", span_id);
    span.in_scope(|| tracing::error!(msg));
}
