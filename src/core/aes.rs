use std::sync::Mutex;
use magic_crypt::{MagicCrypt256, MagicCryptTrait};

static AES: Mutex<Option<MagicCrypt256>> = Mutex::new(None);

pub(super) fn setup(key: impl AsRef<str>) {
    let aes = MagicCrypt256::new(key.as_ref(), None::<&str>);
    let _ = AES
        .lock()
        .unwrap()
        .insert(aes);
}

pub(super) fn encrypt(msg: impl AsRef<str>) -> Option<String> {
    let data = AES.lock()
        .unwrap()
        .as_ref()?
        .encrypt_bytes_to_base64(msg.as_ref());

    Some(data)
}

pub(super) fn decrypt(buf: impl AsRef<str>) -> Option<String> {
    AES.lock()
        .unwrap()
        .as_ref()?
        .decrypt_base64_to_string(buf.as_ref())
        .ok()
}
