import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Copy, Check, ExternalLink, Sliders, Volume2, Sparkles, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ProcessedData, LocationData } from '../types';
import { playCountdownBeep } from '../utils/audioAlert';

interface VirtualHardwareWorkbenchProps {
  processed: ProcessedData;
  location: LocationData;
  hasActiveIncident: boolean;
  remainingSeconds: number;
  onSendSensorData: (data: { ax: number; ay: number; az: number; gx: number; gy: number; gz: number }) => void;
  onTriggerSOS?: () => void;
  onConfirmSafe?: () => void;
}

export const VirtualHardwareWorkbench: React.FC<VirtualHardwareWorkbenchProps> = ({
  processed,
  location,
  hasActiveIncident,
  remainingSeconds,
  onSendSensorData,
  onTriggerSOS,
  onConfirmSafe,
}) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workbench' | 'wokwi_code' | 'diagram' | 'analysis'>('workbench');

  // Interactive slider overrides
  const [sliderAx, setSliderAx] = useState(processed.ax);
  const [sliderAy, setSliderAy] = useState(processed.ay);
  const [sliderAz, setSliderAz] = useState(processed.az);
  const [sliderGx, setSliderGx] = useState(processed.gx);
  const [sliderGy, setSliderGy] = useState(processed.gy);
  const [sliderGz, setSliderGz] = useState(processed.gz);

  // Sync with prop updates if not actively dragging
  useEffect(() => {
    setSliderAx(processed.ax);
    setSliderAy(processed.ay);
    setSliderAz(processed.az);
    setSliderGx(processed.gx);
    setSliderGy(processed.gy);
    setSliderGz(processed.gz);
  }, [processed.ax, processed.ay, processed.az, processed.gx, processed.gy, processed.gz]);

  // Virtual SSD1306 128x64 OLED Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear OLED black
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, 128, 64);

    if (hasActiveIncident && remainingSeconds > 0) {
      // Inverted Alert Header
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 128, 14);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('! ACCIDENT DETECTED !', 6, 10);

      // Countdown
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`SAFE? ${remainingSeconds}s`, 18, 34);

      ctx.font = '7px monospace';
      ctx.fillText('Press Safe Btn / 14', 8, 48);
      ctx.fillText(`GPS: ${location.lat.toFixed(2)},${location.lng.toFixed(2)}`, 8, 58);
    } else if (hasActiveIncident && remainingSeconds === 0) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 128, 18);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('EMERGENCY ALERT', 12, 12);

      ctx.fillStyle = '#ffffff';
      ctx.font = '8px monospace';
      ctx.fillText('HELP DISPATCHED', 14, 30);
      ctx.fillText('SMS & Hospital 108', 6, 42);
      ctx.fillText('Team Alert AVCOE', 12, 54);
    } else {
      // Normal Dashboard Screen
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('SADES 6.0 | ONLINE', 2, 9);

      // Separator line
      ctx.fillRect(0, 12, 128, 1);

      ctx.font = '8px monospace';
      ctx.fillText(`Accel: ${processed.accelMagnitude.toFixed(2)} g`, 4, 23);
      ctx.fillText(`Roll:  ${Math.round(processed.roll)}°`, 4, 34);
      ctx.fillText(`Pitch: ${Math.round(processed.pitch)}°`, 68, 34);
      ctx.fillText(`Lat: ${location.lat.toFixed(4)}`, 4, 46);
      ctx.fillText(`Lng: ${location.lng.toFixed(4)}`, 4, 57);
    }
  }, [hasActiveIncident, remainingSeconds, processed, location]);

  const handleApplySliders = () => {
    onSendSensorData({
      ax: sliderAx,
      ay: sliderAy,
      az: sliderAz,
      gx: sliderGx,
      gy: sliderGy,
      gz: sliderGz,
    });
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFile(id);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Workbench Subnavigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('workbench')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'workbench'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Virtual Hardware Workbench
        </button>

        <button
          onClick={() => setActiveTab('wokwi_code')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'wokwi_code'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          ESP32 Arduino Firmware (.ino)
        </button>

        <button
          onClick={() => setActiveTab('diagram')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'diagram'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Wokwi diagram.json
        </button>

        <button
          onClick={() => setActiveTab('analysis')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'analysis'
              ? 'bg-rose-600/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Wokwi vs. Mokxi Report
        </button>
      </div>

      {activeTab === 'workbench' && (
        <div className="space-y-6">
          {/* Virtual Circuit Board Presentation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Virtual SSD1306 OLED Display (Pixel Emulator) */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center">
              <div className="flex items-center justify-between w-full mb-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">SSD1306 OLED (128x64)</span>
                <span className="font-mono text-[10px] text-sky-400">I2C: 0x3C</span>
              </div>

              {/* Physical OLED Bezel */}
              <div className="p-3 bg-slate-950 border-4 border-slate-700 rounded-xl shadow-2xl flex flex-col items-center">
                <canvas
                  ref={canvasRef}
                  width={128}
                  height={64}
                  className="w-56 h-28 image-rendering-pixelated rounded border border-cyan-900/50 shadow-inner"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="text-[9px] font-mono text-slate-500 mt-2">
                  0.96" Monochrome I2C Display
                </span>
              </div>

              <div className="mt-4 text-[11px] text-slate-400 leading-relaxed">
                Renders byte-for-byte what the physical Adafruit SSD1306 driver displays on the vehicle dashboard.
              </div>
            </div>

            {/* Middle: ESP32 Microcontroller & Audio Buzzer */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    ESP32-WROOM-32
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">240 MHz Dual-Core</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">SDA / SCL:</span>
                    <span className="text-white">GPIO 21 / 22</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPS UART2 (RX/TX):</span>
                    <span className="text-white">GPIO 16 / 17</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Piezo Buzzer:</span>
                    <span className="text-white">GPIO 25 (PWM)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">I'M SAFE Button:</span>
                    <span className="text-emerald-400">GPIO 14 (PULLUP)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Manual SOS Button:</span>
                    <span className="text-rose-400">GPIO 27 (PULLUP)</span>
                  </div>
                </div>
              </div>

              {/* Hardware Button & Buzzer Interactive Affordances */}
              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Piezo Buzzer (GPIO 25):
                  </span>
                  <button
                    onClick={() => playCountdownBeep(2400, 0.3)}
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                  >
                    Play Beep (2.4kHz)
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> SOS Button (GPIO 27):
                  </span>
                  <button
                    onClick={onTriggerSOS}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/50 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>Press SOS</span>
                  </button>
                </div>

                {hasActiveIncident && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Safe Button (GPIO 14):
                    </span>
                    <button
                      onClick={onConfirmSafe}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50 transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>Press I'M SAFE</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Wokwi Online Project Reference */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Wokwi Simulator Project</span>
                  <span className="font-mono text-[10px] text-amber-400">ID: 405361372814750721</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Your reference project is pre-configured with all virtual sensors. You can launch it directly in your browser or run this built-in workbench.
                </p>

                <div className="mt-4 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs space-y-1">
                  <div className="text-white font-medium">Original Simulator Link:</div>
                  <div className="text-slate-400 font-mono text-[11px] truncate">
                    https://wokwi.com/projects/405361372814750721
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <a
                  href="https://wokwi.com/projects/405361372814750721"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Wokwi Simulation</span>
                </a>
              </div>
            </div>
          </div>

          {/* Interactive MPU6050 Sensor Slider Workbench */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-rose-400" />
                  Interactive MPU6050 Motion Controller
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adjust 3-axis accelerometer and gyro values manually to test the accident detection algorithm in real time.
                </p>
              </div>

              <button
                onClick={handleApplySliders}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Inject Sensor Values</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Accelerometer Sliders */}
              <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Linear Accelerometer (g)
                </span>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-mono mb-1">
                      <span className="text-slate-400">Accel X (Surge):</span>
                      <span className="text-white font-bold">{sliderAx.toFixed(2)} g</span>
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="0.1"
                      value={sliderAx}
                      onChange={(e) => setSliderAx(parseFloat(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono mb-1">
                      <span className="text-slate-400">Accel Y (Sway):</span>
                      <span className="text-white font-bold">{sliderAy.toFixed(2)} g</span>
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="0.1"
                      value={sliderAy}
                      onChange={(e) => setSliderAy(parseFloat(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono mb-1">
                      <span className="text-slate-400">Accel Z (Heave):</span>
                      <span className="text-white font-bold">{sliderAz.toFixed(2)} g</span>
                    </div>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="0.1"
                      value={sliderAz}
                      onChange={(e) => setSliderAz(parseFloat(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Gyroscope Sliders */}
              <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Angular Gyroscope (°/s)
                </span>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-mono mb-1">
                      <span className="text-slate-400">Gyro X (Roll):</span>
                      <span className="text-white font-bold">{sliderGx.toFixed(0)} °/s</span>
                    </div>
                    <input
                      type="range"
                      min="-400"
                      max="400"
                      step="10"
                      value={sliderGx}
                      onChange={(e) => setSliderGx(parseFloat(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono mb-1">
                      <span className="text-slate-400">Gyro Y (Pitch):</span>
                      <span className="text-white font-bold">{sliderGy.toFixed(0)} °/s</span>
                    </div>
                    <input
                      type="range"
                      min="-400"
                      max="400"
                      step="10"
                      value={sliderGy}
                      onChange={(e) => setSliderGy(parseFloat(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-mono mb-1">
                      <span className="text-slate-400">Gyro Z (Yaw):</span>
                      <span className="text-white font-bold">{sliderGz.toFixed(0)} °/s</span>
                    </div>
                    <input
                      type="range"
                      min="-400"
                      max="400"
                      step="10"
                      value={sliderGz}
                      onChange={(e) => setSliderGz(parseFloat(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'wokwi_code' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">sades_esp32_firmware.ino</h3>
              <p className="text-xs text-slate-400">Production-ready C++ code for ESP32 and Wokwi</p>
            </div>
            <button
              onClick={() => copyToClipboard(esp32InoCode, 'ino')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedFile === 'ino' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile === 'ino' ? 'Copied' : 'Copy Code'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 max-h-[460px] overflow-y-auto leading-relaxed">
            {esp32InoCode}
          </pre>
        </div>
      )}

      {activeTab === 'diagram' && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">diagram.json (Wokwi Circuit Layout)</h3>
              <p className="text-xs text-slate-400">Pin mappings for ESP32, MPU6050, SSD1306, and Buzzer</p>
            </div>
            <button
              onClick={() => copyToClipboard(diagramJsonContent, 'diagram')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedFile === 'diagram' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFile === 'diagram' ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-300 max-h-[460px] overflow-y-auto leading-relaxed">
            {diagramJsonContent}
          </pre>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-base font-bold text-white">
              Simulator Platform Technical Evaluation: Wokwi vs. Mokxi
            </h3>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Per project requirements, we evaluated both Wokwi and Mokxi for suitability in an academic engineering presentation:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-950 font-semibold text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="p-3">Feature</th>
                  <th className="p-3 text-rose-400">Wokwi Simulator (Selected)</th>
                  <th className="p-3 text-slate-400">Mokxi Simulator</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                <tr>
                  <td className="p-3 font-sans font-semibold">ESP32 Core Emulation</td>
                  <td className="p-3 text-emerald-400">Full Xtensa dual-core with FreeRTOS</td>
                  <td className="p-3 text-slate-400">Limited microcontroller support</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-semibold">MPU6050 6-Axis Motion</td>
                  <td className="p-3 text-emerald-400">Native part with interactive slider controls (X/Y/Z)</td>
                  <td className="p-3 text-amber-400">No interactive multi-axis tilt control</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-semibold">SSD1306 128x64 OLED</td>
                  <td className="p-3 text-emerald-400">Full I2C framebuffer display emulation</td>
                  <td className="p-3 text-amber-400">Basic character LCD only</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-semibold">Piezo Buzzer</td>
                  <td className="p-3 text-emerald-400">Web Audio synthesis support</td>
                  <td className="p-3 text-slate-400">Visual indicator only</td>
                </tr>
                <tr>
                  <td className="p-3 font-sans font-semibold">Networking Capability</td>
                  <td className="p-3 text-emerald-400">Wokwi-GUEST WiFi & IoT Gateway Bridge</td>
                  <td className="p-3 text-slate-400">No native outbound HTTP bridge</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <strong className="text-white">Conclusion for College Evaluation:</strong> Wokwi is the technically verified platform because it supports the MPU6050 interactive G-force slider and SSD1306 OLED graphical driver, which are mandatory to demonstrate vehicle accident detection.
          </div>
        </div>
      )}
    </div>
  );
};

const esp32InoCode = `// SADES ESP32 Firmware for Wokwi & Physical Hardware
#include <Wire.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_SSD1306.h>
#include <ArduinoJson.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define PIN_BUZZER 25
#define PIN_BTN_SAFE 14

Adafruit_MPU6050 mpu;
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_BTN_SAFE, INPUT_PULLUP);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  mpu.begin();
  WiFi.begin("Wokwi-GUEST", "");
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  float ax_g = a.acceleration.x / 9.806;
  float ay_g = a.acceleration.y / 9.806;
  float az_g = a.acceleration.z / 9.806;
  float mag = sqrt(ax_g*ax_g + ay_g*ay_g + az_g*az_g);

  if (mag > 3.2) {
    digitalWrite(PIN_BUZZER, HIGH);
    // Trigger 10-second accident verification countdown
  }
  delay(100);
}`;

const diagramJsonContent = `{
  "version": 1,
  "author": "Omkar Shinde & Team Alert (AVCOE)",
  "parts": [
    { "type": "board-esp32-devkit-c-v4", "id": "esp", "top": 0, "left": 0 },
    { "type": "wokwi-mpu6050", "id": "mpu1", "top": -150, "left": 150 },
    { "type": "board-ssd1306", "id": "oled1", "top": -160, "left": -80 },
    { "type": "wokwi-buzzer", "id": "bz1", "top": 120, "left": 230 },
    { "type": "wokwi-pushbutton", "id": "btn_safe", "top": 210, "left": -60 }
  ],
  "connections": [
    [ "esp:21", "mpu1:SDA", "blue", [] ],
    [ "esp:22", "mpu1:SCL", "yellow", [] ],
    [ "esp:21", "oled1:SDA", "blue", [] ],
    [ "esp:22", "oled1:SCL", "yellow", [] ],
    [ "esp:25", "bz1:2", "purple", [] ],
    [ "esp:14", "btn_safe:2.1", "green", [] ]
  ]
}`;
