use tracing;

#[tauri::command]
pub fn debug(msg: String, span_id: Option<String>) {
    if let Some(id) = span_id {
        let span = tracing::debug_span!("{}", id);
        span.in_scope(|| tracing::debug!(msg))
    } else {
        tracing::debug!(msg)
    }
}

#[tauri::command]
pub fn trace(msg: String, span_id: Option<String>) {
    if let Some(id) = span_id {
        let span = tracing::trace_span!("{}", id);
        span.in_scope(|| tracing::trace!(msg))
    } else {
        tracing::trace!(msg)
    }
}

#[tauri::command]
pub fn info(msg: String, span_id: Option<String>) {
    if let Some(id) = span_id {
        let span = tracing::info_span!("{}", id);
        span.in_scope(|| tracing::info!(msg))
    } else {
        tracing::info!(msg)
    }
}

#[tauri::command]
pub fn warn(msg: String, span_id: Option<String>) {
    if let Some(id) = span_id {
        let span = tracing::warn_span!("{}", id);
        span.in_scope(|| tracing::warn!(msg))
    } else {
        tracing::warn!(msg)
    }
}

#[tauri::command]
pub fn error(msg: String, span_id: Option<String>) {
    if let Some(id) = span_id {
        let span = tracing::error_span!("{}", id);
        span.in_scope(|| tracing::error!(msg))
    } else {
        tracing::error!(msg)
    }
}
