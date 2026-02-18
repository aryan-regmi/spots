/** Represents all backend errors. */
#[derive(Debug, Clone, serde::Serialize)]
pub enum SpotsError {
    _SomeError,
}

impl Into<String> for SpotsError {
    fn into(self) -> String {
        match self {
            SpotsError::_SomeError => "SOME ERROR".into(),
        }
    }
}
