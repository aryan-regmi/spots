use std::sync::LazyLock;

use tracing::{self, span, Level, Span};

const FRONT_END_SPAN: LazyLock<Span> = LazyLock::new(|| span!(Level::TRACE, "FRONTEND"));

#[tauri::command]
pub fn debug(msg: String) {
    let parent = &*FRONT_END_SPAN;
    let span = span!(parent: parent, Level::DEBUG, "");
    span.in_scope(|| tracing::debug!("{}", msg));
}

#[tauri::command]
pub fn trace(msg: String) {
    let parent = &*FRONT_END_SPAN;
    let span = span!(parent: parent, Level::TRACE, "");
    span.in_scope(|| tracing::trace!("{}", msg));
}

#[tauri::command]
pub fn info(msg: String) {
    let parent = &*FRONT_END_SPAN;
    let span = span!(parent: parent, Level::INFO, "");
    span.in_scope(|| tracing::info!("{}", msg));
}

#[tauri::command]
pub fn warn(msg: String) {
    let parent = &*FRONT_END_SPAN;
    let span = span!(parent: parent, Level::WARN, "");
    span.in_scope(|| tracing::warn!("{}", msg));
}

#[tauri::command]
pub fn error(msg: String) {
    let parent = &*FRONT_END_SPAN;
    let span = span!(parent: parent, Level::ERROR, "");
    span.in_scope(|| tracing::error!("{}", msg));
}
