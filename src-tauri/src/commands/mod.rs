use tauri::State;

use crate::database::Database;

pub mod auth;
pub mod users;

pub type DatabaseState<'a> = State<'a, Database>;
