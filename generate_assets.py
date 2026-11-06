import zlib
import struct
import math

def save_png(filename, width, height, rgba_data):
    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)
    
    ihdr = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    raw = bytearray()
    for y in range(height):
        raw.append(0)  # filter type None
        row_start = y * width * 4
        raw.extend(rgba_data[row_start : row_start + width * 4])
    
    idat = zlib.compress(bytes(raw), 6)
    png_data = b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', ihdr) + chunk(b'IDAT', idat) + chunk(b'IEND', b'')
    with open(filename, 'wb') as f:
        f.write(png_data)
    print(f"Generated {filename} ({width}x{height}, {len(png_data)} bytes)")

class Canvas:
    def __init__(self, w, h):
        self.w = w
        self.h = h
        self.buf = bytearray(w * h * 4)

    def set_pixel(self, x, y, r, g, b, a=255):
        if 0 <= x < self.w and 0 <= y < self.h:
            idx = (y * self.w + x) * 4
            if a == 255:
                self.buf[idx] = r
                self.buf[idx+1] = g
                self.buf[idx+2] = b
                self.buf[idx+3] = 255
            elif a > 0:
                alpha = a / 255.0
                inv = 1.0 - alpha
                self.buf[idx] = int(r * alpha + self.buf[idx] * inv)
                self.buf[idx+1] = int(g * alpha + self.buf[idx+1] * inv)
                self.buf[idx+2] = int(b * alpha + self.buf[idx+2] * inv)
                self.buf[idx+3] = min(255, int(a + self.buf[idx+3] * inv))

    def fill_rect(self, x0, y0, w, h, r, g, b, a=255):
        x1 = min(self.w, max(0, x0 + w))
        y1 = min(self.h, max(0, y0 + h))
        x0 = max(0, x0)
        y0 = max(0, y0)
        for y in range(y0, y1):
            row_idx = (y * self.w + x0) * 4
            for x in range(x0, x1):
                idx = (y * self.w + x) * 4
                if a == 255:
                    self.buf[idx] = r
                    self.buf[idx+1] = g
                    self.buf[idx+2] = b
                    self.buf[idx+3] = 255
                elif a > 0:
                    alpha = a / 255.0
                    inv = 1.0 - alpha
                    self.buf[idx] = int(r * alpha + self.buf[idx] * inv)
                    self.buf[idx+1] = int(g * alpha + self.buf[idx+1] * inv)
                    self.buf[idx+2] = int(b * alpha + self.buf[idx+2] * inv)
                    self.buf[idx+3] = min(255, int(a + self.buf[idx+3] * inv))

    def fill_rounded_rect(self, x0, y0, w, h, radius, r, g, b, a=255):
        x1 = min(self.w, max(0, x0 + w))
        y1 = min(self.h, max(0, y0 + h))
        x0 = max(0, x0)
        y0 = max(0, y0)
        r2 = radius * radius
        for y in range(y0, y1):
            for x in range(x0, x1):
                dx = 0
                dy = 0
                if x < x0 + radius: dx = (x0 + radius) - x
                elif x > x0 + w - 1 - radius: dx = x - (x0 + w - 1 - radius)
                if y < y0 + radius: dy = (y0 + radius) - y
                elif y > y0 + h - 1 - radius: dy = y - (y0 + h - 1 - radius)
                
                if dx > 0 and dy > 0:
                    dist2 = dx * dx + dy * dy
                    if dist2 > r2:
                        continue
                    elif dist2 > (radius - 1) * (radius - 1):
                        blend_a = int(a * (1.0 - (math.sqrt(dist2) - (radius - 1))))
                        self.set_pixel(x, y, r, g, b, max(0, blend_a))
                        continue
                self.set_pixel(x, y, r, g, b, a)

    def draw_v_gradient(self, x0, y0, w, h, c1, c2):
        for y in range(h):
            t = y / max(1, h - 1)
            r = int(c1[0] * (1 - t) + c2[0] * t)
            g = int(c1[1] * (1 - t) + c2[1] * t)
            b = int(c1[2] * (1 - t) + c2[2] * t)
            a = int(c1[3] * (1 - t) + c2[3] * t)
            self.fill_rect(x0, y0 + y, w, 1, r, g, b, a)

    def draw_circle(self, cx, cy, radius, r, g, b, a=255):
        x0 = max(0, int(cx - radius - 1))
        x1 = min(self.w, int(cx + radius + 1))
        y0 = max(0, int(cy - radius - 1))
        y1 = min(self.h, int(cy + radius + 1))
        r2 = radius * radius
        r_inner = (radius - 1) * (radius - 1)
        for y in range(y0, y1):
            for x in range(x0, x1):
                d2 = (x - cx) ** 2 + (y - cy) ** 2
                if d2 <= r_inner:
                    self.set_pixel(x, y, r, g, b, a)
                elif d2 <= r2:
                    dist = math.sqrt(d2)
                    frac = radius - dist
                    self.set_pixel(x, y, r, g, b, int(a * max(0, frac)))

    def draw_line(self, x0, y0, x1, y1, r, g, b, a=255, thickness=1):
        dx = abs(x1 - x0)
        dy = abs(y1 - y0)
        sx = 1 if x0 < x1 else -1
        sy = 1 if y0 < y1 else -1
        err = dx - dy
        x, y = x0, y0
        while True:
            for tx in range(-thickness // 2, thickness // 2 + 1):
                for ty in range(-thickness // 2, thickness // 2 + 1):
                    self.set_pixel(x + tx, y + ty, r, g, b, a)
            if x == x1 and y == y1:
                break
            e2 = 2 * err
            if e2 > -dy:
                err -= dy
                x += sx
            if e2 < dx:
                err += dx
                y += sy

def build_typewriter_body(filename):
    W, H = 1280, 720
    c = Canvas(W, H)
    
    # Outer Chassis Drop Shadow
    c.fill_rounded_rect(225, 290, 830, 415, 30, 0, 0, 0, 95)
    c.fill_rounded_rect(235, 300, 810, 400, 24, 0, 0, 0, 140)

    # Platen Carriage Back Tray
    c.fill_rounded_rect(300, 180, 680, 85, 8, 22, 25, 30, 255)
    c.draw_v_gradient(302, 182, 676, 75, (45, 50, 58, 255), (28, 32, 38, 255))
    c.fill_rect(302, 182, 676, 3, 190, 195, 205, 255)
    c.fill_rect(302, 185, 676, 1, 90, 95, 105, 255)
    for mx in range(320, 960, 12):
        tick_h = 6 if mx % 48 == 0 else 3
        c.fill_rect(mx, 190, 1, tick_h, 150, 155, 165, 200)

    # Carriage Return Lever (Left Side)
    c.draw_line(285, 260, 265, 210, 160, 165, 175, 255, thickness=6)
    c.draw_line(265, 210, 235, 175, 195, 200, 210, 255, thickness=6)
    c.draw_line(235, 175, 220, 160, 225, 230, 240, 255, thickness=6)
    c.draw_circle(216, 156, 11, 230, 235, 245, 255)
    c.draw_circle(214, 154, 5, 255, 255, 255, 255)

    # Platen Knobs
    c.fill_rounded_rect(270, 252, 36, 68, 6, 18, 18, 20, 255)
    for ky in range(256, 316, 5):
        c.fill_rect(272, ky, 32, 2, 85, 88, 95, 255)
    c.draw_circle(288, 286, 7, 190, 195, 205, 255)
    c.draw_circle(288, 286, 3, 50, 52, 58, 255)

    c.fill_rounded_rect(974, 252, 36, 68, 6, 18, 18, 20, 255)
    for ky in range(256, 316, 5):
        c.fill_rect(976, ky, 32, 2, 85, 88, 95, 255)
    c.draw_circle(992, 286, 7, 190, 195, 205, 255)
    c.draw_circle(992, 286, 3, 50, 52, 58, 255)

    # Platen Roller Rubber Cylinder (Slot & Backing)
    c.fill_rounded_rect(308, 250, 664, 72, 4, 15, 15, 18, 255)
    c.draw_v_gradient(310, 250, 660, 24, (28, 28, 32, 255), (48, 50, 56, 255))
    c.draw_v_gradient(310, 274, 660, 30, (48, 50, 56, 255), (20, 21, 24, 255))
    c.fill_rect(310, 304, 660, 18, 10, 10, 12, 255)

    # Main Typewriter Body Chassis
    c.fill_rounded_rect(240, 306, 800, 396, 22, 24, 28, 34, 255)
    c.draw_v_gradient(244, 308, 792, 130, (42, 48, 58, 255), (28, 33, 40, 255))
    c.draw_v_gradient(244, 438, 792, 260, (28, 33, 40, 255), (18, 22, 27, 255))

    c.fill_rect(260, 308, 760, 2, 100, 112, 128, 255)
    c.fill_rect(260, 310, 760, 1, 55, 62, 72, 255)
    c.fill_rect(242, 320, 2, 360, 70, 78, 90, 200)
    c.fill_rect(1036, 320, 2, 360, 45, 52, 62, 200)

    # Typebasket Recess
    c.fill_rounded_rect(420, 326, 440, 96, 16, 12, 14, 18, 255)
    c.draw_v_gradient(424, 328, 432, 90, (14, 16, 20, 255), (24, 27, 34, 255))

    cx_type = 640
    cy_type = 318
    for i in range(-24, 25):
        angle = math.radians(i * 3.4)
        x_base = cx_type + int(math.sin(angle) * 115)
        y_base = 415 - int(math.cos(angle) * 15)
        x_top = cx_type + int(math.sin(angle * 0.45) * 45)
        y_top = cy_type + int(math.cos(angle * 0.45) * 12)
        c.draw_line(x_base, y_base, x_top, y_top, 85, 95, 110, 220, thickness=2)
        c.draw_line(x_base + 1, y_base, x_top + 1, y_top, 40, 45, 55, 180, thickness=1)

    # Vintage Brand Emblem Badge
    badge_x = 540
    badge_y = 398
    badge_w = 200
    badge_h = 32
    c.fill_rounded_rect(badge_x, badge_y, badge_w, badge_h, 8, 14, 15, 18, 255)
    c.fill_rounded_rect(badge_x + 1, badge_y + 1, badge_w - 2, badge_h - 2, 7, 212, 175, 75, 255)
    c.fill_rounded_rect(badge_x + 3, badge_y + 3, badge_w - 6, badge_h - 6, 6, 20, 22, 26, 255)
    c.fill_rect(badge_x + 10, badge_y + 15, badge_w - 20, 2, 212, 175, 75, 220)
    c.draw_circle(badge_x + 8, badge_y + 16, 3, 220, 185, 85, 255)
    c.draw_circle(badge_x + badge_w - 8, badge_y + 16, 3, 220, 185, 85, 255)

    # Keyboard Well Recess
    well_x = 280
    well_y = 442
    well_w = 720
    well_h = 246
    c.fill_rounded_rect(well_x, well_y, well_w, well_h, 14, 10, 12, 15, 255)
    c.draw_v_gradient(well_x + 3, well_y + 3, well_w - 6, 40, (8, 9, 12, 255), (16, 18, 23, 255))
    c.fill_rect(well_x + 3, well_y + 43, well_w - 6, well_h - 46, 16, 18, 23, 255)
    c.fill_rect(well_x + 6, well_y + 2, well_w - 12, 1, 95, 105, 120, 220)

    # Corner Rivets
    screws = [
        (254, 320), (1026, 320),
        (254, 686), (1026, 686),
        (308, 436), (972, 436)
    ]
    for sx, sy in screws:
        c.draw_circle(sx, sy, 5, 45, 50, 58, 255)
        c.draw_circle(sx, sy, 4, 180, 185, 195, 255)
        c.draw_circle(sx - 1, sy - 1, 2, 230, 235, 245, 255)
        c.draw_line(sx - 3, sy, sx + 3, sy, 30, 32, 38, 255, thickness=1)

    save_png(filename, W, H, c.buf)

def build_typewriter_roller_mask(filename):
    W, H = 1280, 720
    c = Canvas(W, H)

    # Chrome Alignment Ruler Bar
    bar_x = 308
    bar_y = 292
    bar_w = 664
    bar_h = 16

    c.fill_rect(bar_x, bar_y + bar_h, bar_w, 4, 0, 0, 0, 110)
    c.fill_rect(bar_x, bar_y + bar_h + 4, bar_w, 2, 0, 0, 0, 50)

    c.fill_rounded_rect(bar_x, bar_y, bar_w, bar_h, 3, 140, 145, 155, 255)
    c.fill_rect(bar_x + 2, bar_y + 1, bar_w - 4, 2, 245, 250, 255, 255)
    c.draw_v_gradient(bar_x + 2, bar_y + 3, bar_w - 4, 5, (220, 225, 235, 255), (170, 178, 190, 255))
    c.draw_v_gradient(bar_x + 2, bar_y + 8, bar_w - 4, 4, (140, 148, 160, 255), (180, 188, 200, 255))
    c.fill_rect(bar_x + 2, bar_y + 12, bar_w - 4, 3, 85, 92, 105, 255)

    for tx in range(bar_x + 20, bar_x + bar_w - 20, 8):
        is_major = ((tx - (bar_x + 20)) % 40 == 0)
        tick_len = 6 if is_major else 3
        c.fill_rect(tx, bar_y + 4, 1, tick_len, 40, 44, 50, 220)
        c.fill_rect(tx + 1, bar_y + 4, 1, tick_len, 255, 255, 255, 140)

    c.fill_rounded_rect(bar_x - 4, bar_y - 2, 12, bar_h + 4, 3, 210, 215, 225, 255)
    c.draw_circle(bar_x + 2, bar_y + bar_h // 2, 3, 70, 75, 85, 255)

    c.fill_rounded_rect(bar_x + bar_w - 8, bar_y - 2, 12, bar_h + 4, 3, 210, 215, 225, 255)
    c.draw_circle(bar_x + bar_w - 2, bar_y + bar_h // 2, 3, 70, 75, 85, 255)

    # Paper Clamp Fingers / Spring Bail Rollers
    clamp_left_x = 365
    c.fill_rounded_rect(clamp_left_x, bar_y - 10, 16, 32, 4, 190, 195, 205, 255)
    c.draw_v_gradient(clamp_left_x + 2, bar_y - 8, 12, 28, (240, 245, 255, 255), (140, 145, 155, 255))
    c.fill_rounded_rect(clamp_left_x + 2, bar_y - 12, 12, 8, 3, 25, 26, 30, 255)
    c.fill_rect(clamp_left_x + 4, bar_y + 16, 8, 4, 80, 85, 95, 255)

    clamp_right_x = 895
    c.fill_rounded_rect(clamp_right_x, bar_y - 10, 16, 32, 4, 190, 195, 205, 255)
    c.draw_v_gradient(clamp_right_x + 2, bar_y - 8, 12, 28, (240, 245, 255, 255), (140, 145, 155, 255))
    c.fill_rounded_rect(clamp_right_x + 2, bar_y - 12, 12, 8, 3, 25, 26, 30, 255)
    c.fill_rect(clamp_right_x + 4, bar_y + 16, 8, 4, 80, 85, 95, 255)

    # Center Ribbon Guide / Vibrator Fork
    vibrator_cx = 640
    ribbon_w = 140
    ribbon_x = vibrator_cx - ribbon_w // 2
    ribbon_y = bar_y + 8
    c.fill_rect(ribbon_x, ribbon_y, ribbon_w, 4, 25, 25, 30, 230)
    c.fill_rect(ribbon_x, ribbon_y + 4, ribbon_w, 4, 180, 35, 40, 230)

    c.draw_line(vibrator_cx - 24, bar_y + 22, vibrator_cx - 10, bar_y - 6, 200, 205, 215, 255, thickness=4)
    c.draw_line(vibrator_cx - 24, bar_y + 22, vibrator_cx - 10, bar_y - 6, 255, 255, 255, 180, thickness=1)
    c.draw_line(vibrator_cx + 24, bar_y + 22, vibrator_cx + 10, bar_y - 6, 200, 205, 215, 255, thickness=4)
    c.draw_line(vibrator_cx + 24, bar_y + 22, vibrator_cx + 10, bar_y - 6, 255, 255, 255, 180, thickness=1)
    c.fill_rect(vibrator_cx - 9, bar_y - 4, 18, 16, 40, 44, 52, 255)
    c.fill_rect(vibrator_cx - 6, bar_y - 2, 12, 12, 0, 0, 0, 200)

    c.fill_rounded_rect(vibrator_cx - 28, bar_y + 14, 56, 14, 3, 170, 175, 185, 255)
    c.draw_v_gradient(vibrator_cx - 26, bar_y + 15, 52, 11, (230, 235, 245, 255), (130, 135, 145, 255))
    c.draw_circle(vibrator_cx - 18, bar_y + 20, 2, 50, 55, 65, 255)
    c.draw_circle(vibrator_cx + 18, bar_y + 20, 2, 50, 55, 65, 255)

    save_png(filename, W, H, c.buf)

if __name__ == '__main__':
    build_typewriter_body('public/assets/typewriter-body.png')
    build_typewriter_roller_mask('public/assets/typewriter-roller-mask.png')

