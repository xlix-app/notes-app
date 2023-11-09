use super::aes;

#[tauri::command]
pub(crate) fn aes_setup(key: &str) {
    aes::setup(key);
}

#[tauri::command]
pub(crate) fn aes_encrypt(msg: &str) -> Option<String> {
    aes::encrypt(msg)
}

#[tauri::command]
pub(crate) fn aes_decrypt(buf: &str) -> Option<String> {
    aes::decrypt(buf)
}
