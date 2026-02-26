use std::sync::LazyLock;

use tracing::{self, span, Level, Span};

const FRONT_END_SPAN: LazyLock<Span> = LazyLock::new(|| span!(Level::TRACE, "FRONTEND"));

#[tauri::command]
pub fn debug(msg: String, data: Option<serde_json::Value>) {
    if let Some(data) = data {
        FRONT_END_SPAN.in_scope(|| {
            tracing::debug!(
                data = serde_json::to_string_pretty(&data).expect("Invalid data from frontend"),
                msg
            )
        })
    } else {
        FRONT_END_SPAN.in_scope(|| tracing::debug!(msg))
    }
}

#[tauri::command]
pub fn trace(msg: String, data: Option<serde_json::Value>) {
    if let Some(data) = data {
        FRONT_END_SPAN.in_scope(|| {
            tracing::trace!(
                data = serde_json::to_string_pretty(&data).expect("Invalid data from frontend"),
                msg
            )
        })
    } else {
        FRONT_END_SPAN.in_scope(|| tracing::trace!(msg))
    }
}

#[tauri::command]
pub fn info(msg: String, data: Option<serde_json::Value>) {
    if let Some(data) = data {
        FRONT_END_SPAN.in_scope(|| {
            tracing::info!(
                data = serde_json::to_string_pretty(&data).expect("Invalid data from frontend"),
                msg
            )
        })
    } else {
        FRONT_END_SPAN.in_scope(|| tracing::info!(msg))
    }
}

#[tauri::command]
pub fn warn(msg: String, data: Option<serde_json::Value>) {
    if let Some(data) = data {
        FRONT_END_SPAN.in_scope(|| {
            tracing::warn!(
                data = serde_json::to_string_pretty(&data).expect("Invalid data from frontend"),
                msg
            )
        })
    } else {
        FRONT_END_SPAN.in_scope(|| tracing::warn!(msg))
    }
}

#[tauri::command]
pub fn error(msg: String, data: Option<serde_json::Value>) {
    if let Some(data) = data {
        FRONT_END_SPAN.in_scope(|| {
            tracing::error!(
                data = serde_json::to_string_pretty(&data).expect("Invalid data from frontend"),
                msg
            )
        })
    } else {
        FRONT_END_SPAN.in_scope(|| tracing::error!(msg))
    }
}
