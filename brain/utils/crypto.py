# FILE: brain/utils/crypto.py
# Purpose: Provides cryptographic utilities, specifically for token decryption.

from debug_flags import debug_crypto as debug
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
import base64
import binascii

from config import ENCRYPT_SECRET

# Validate the encryption secret key length.
if not ENCRYPT_SECRET or len(ENCRYPT_SECRET.encode("utf-8")) != 32:
    raise ValueError("ENCRYPT_SECRET must be exactly 32 characters")

def decrypt_token(encrypted: str) -> str:
    """
    Decrypts a token encoded in "iv_hex:data_hex" format using AES-256-CBC.

    Args:
        encrypted (str): The encrypted token string.

    Returns:
        str: The decrypted UTF-8 string.

    Raises:
        ValueError: If decryption fails.
    """
    try:
        iv_hex, data_hex = encrypted.split(":")
        iv = bytes.fromhex(iv_hex)
        data = bytes.fromhex(data_hex)
        key = ENCRYPT_SECRET.encode("utf-8")

        cipher = AES.new(key, AES.MODE_CBC, iv)
        decrypted = unpad(cipher.decrypt(data), AES.block_size)
        return decrypted.decode("utf-8")

    except Exception as e:
        raise ValueError(f"Failed to decrypt token: {e}")