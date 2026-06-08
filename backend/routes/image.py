"""PHOTON — Image Routes (Upload / Save / Utilities)"""

from flask import Blueprint, request, jsonify
import cv2
import numpy as np
import base64

image_bp = Blueprint('image', __name__)


# ── Shared Helpers (used by all future route files) ──────────
def decode_image(b64_string):
    """Decode a base64 data-URI string into an OpenCV BGR image."""
    # Strip the data:image/...;base64, prefix if present
    if ',' in b64_string:
        b64_string = b64_string.split(',', 1)[1]
    img_bytes = base64.b64decode(b64_string)
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError('Failed to decode image')
    return img


def encode_image(img, fmt='png'):
    """Encode an OpenCV BGR image to a base64 data-URI string."""
    ext = f'.{fmt}'
    _, buffer = cv2.imencode(ext, img)
    b64 = base64.b64encode(buffer).decode('utf-8')
    mime = 'jpeg' if fmt in ('jpg', 'jpeg') else fmt
    return f'data:image/{mime};base64,{b64}'


# ── Upload ───────────────────────────────────────────────────
@image_bp.route('/upload', methods=['POST'])
def upload():
    """Receive an image file, decode via OpenCV, return base64 + metadata."""
    file = request.files.get('image')
    if not file:
        return jsonify({'error': 'No image provided'}), 400

    try:
        file_bytes = file.read()
        nparr = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({'error': 'Invalid image file'}), 400

        h, w = img.shape[:2]

        # Encode to PNG for lossless transfer to frontend
        _, buffer = cv2.imencode('.png', img)
        b64 = base64.b64encode(buffer).decode('utf-8')

        return jsonify({
            'width': w,
            'height': h,
            'channels': img.shape[2] if len(img.shape) == 3 else 1,
            'format': file.content_type or 'image/png',
            'original_name': file.filename,
            'size': len(file_bytes),
            'image_b64': f'data:image/png;base64,{b64}',
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── Save / Export ────────────────────────────────────────────
@image_bp.route('/save', methods=['POST'])
def save():
    """Re-encode an image in the requested format and quality."""
    data = request.json
    if not data or 'image_b64' not in data:
        return jsonify({'error': 'No image data provided'}), 400

    try:
        img = decode_image(data['image_b64'])
        fmt = data.get('format', 'png').lower()
        quality = int(data.get('quality', 95))

        if fmt in ('jpg', 'jpeg'):
            params = [cv2.IMWRITE_JPEG_QUALITY, quality]
            _, buffer = cv2.imencode('.jpg', img, params)
            mime = 'jpeg'
        elif fmt == 'bmp':
            _, buffer = cv2.imencode('.bmp', img)
            mime = 'bmp'
        else:
            _, buffer = cv2.imencode('.png', img)
            mime = 'png'

        b64 = base64.b64encode(buffer).decode('utf-8')

        return jsonify({
            'file_b64': f'data:image/{mime};base64,{b64}',
            'size': len(buffer),
            'format': fmt,
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
