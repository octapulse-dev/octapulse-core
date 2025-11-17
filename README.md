# OctaPulse - Aquaculture Fish Analysis Platform

A professional aquaculture fish analysis platform using advanced computer vision and AI to provide comprehensive fish measurements and analysis.

![OctaPulse Logo](https://via.placeholder.com/400x100?text=OctaPulse+Aquaculture+Analysis)

## 🌊 What is OctaPulse?

OctaPulse is an end-to-end platform for analyzing fish images in aquaculture workflows. It automates precise measurements (lengths, areas), detects anatomical features using a segmentation model, calibrates using grid patterns, and produces visualizations and structured outputs for downstream decisions.

## 🐟 Features

### Core Analysis Capabilities
- **Comprehensive Fish Measurements**: Automated length, width, and anatomical measurements
- **Advanced Computer Vision**: Segmentation-based detection for precise fish part detection
- **Grid Calibration**: Automatic calibration using grid patterns for accurate measurements
- **Color Analysis**: Fish coloration analysis with dominant color extraction
- **Batch Processing**: Analyze multiple fish images simultaneously
- **Visualization Generation**: Detailed annotated visualizations with measurements

### Technical Features
- **Professional FastAPI Backend**: High-performance, scalable API architecture
- **Modern React Frontend**: Intuitive Next.js-based user interface
- **Real-time Progress Tracking**: Live updates during analysis processing
- **Export Capabilities**: JSON export of all analysis results
- **Error Handling**: Comprehensive error handling and validation
- **Professional Logging**: Structured logging for monitoring and debugging

## 🏗️ Architecture

```
octapulse-core/
├── server/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Configuration and utilities
│   │   ├── models/        # Pydantic models
│   │   ├── services/      # Business logic
│   │   └── utils/         # Helper functions
│   ├── documents/         # Model and analysis scripts
│   ├── uploads/           # Image uploads storage
│   ├── results/           # Analysis results storage
│   └── requirements.txt   # Python dependencies
├── client/                # Next.js Frontend
│   ├── components/        # React components
│   ├── lib/              # Utilities and API client
│   ├── app/              # Next.js app directory
│   └── package.json      # Node.js dependencies
└── README.md
```

## 🚀 Quick Start

### Start Everything (single command)

From the repository root, run:
```bash
./start.sh
```

This launches:
- Backend (FastAPI): `python server/start_server.py` on port 8000
- Frontend (Next.js): `npm run dev` on port 3000 (installs deps if needed)

Press Ctrl+C to stop both. Note: Ensure your Python environment is activated before running if needed.

### Prerequisites
- Python 3.8+
- Node.js 18+
- CUDA-capable GPU (optional, for faster processing)

### Backend Setup

1. **Navigate to server directory**:
   ```bash
   cd server
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

5. **Start the server**:
   ```bash
   python start_server.py
   ```

   The API will be available at `http://localhost:8000`
   - API Documentation: `http://localhost:8000/docs`
   - Alternative Docs: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to client directory**:
   ```bash
   cd client
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

## 📊 Usage

### Single Fish Analysis

1. **Upload Image**: Drag and drop or select a fish image with visible grid pattern
2. **Configure Analysis**: Adjust grid square size and analysis options
3. **Run Analysis**: Click "Analyze Fish" to start the process
4. **View Results**: Comprehensive results with measurements, visualizations, and exports

### Batch Analysis

1. **Upload Multiple Images**: Select multiple fish images for batch processing
2. **Configure Settings**: Set analysis parameters for all images
3. **Monitor Progress**: Track processing progress in real-time
4. **Download Results**: Export individual or combined analysis results

### API Usage

#### Single Image Analysis
```bash
# Upload image
curl -X POST "http://localhost:8000/api/v1/upload/single" \
  -F "file=@fish_image.jpg" \
  -F "grid_square_size=1.0"

# Analyze image
curl -X POST "http://localhost:8000/api/v1/analysis/single" \
  -H "Content-Type: application/json" \
  -d '{
    "image_path": "/path/to/uploaded/image.jpg",
    "grid_square_size_inches": 1.0,
    "include_visualizations": true
  }'
```

## 🔧 Configuration

### Backend Configuration (`server/.env`)

| Parameter | Description | Default |
|-----------|-------------|---------|
| `MODEL_PATH` | Path to model file | `documents/best.pt` |
| `GRID_SQUARE_SIZE_INCHES` | Default grid square size | `1.0` |
| `MAX_UPLOAD_SIZE` | Maximum file upload size (bytes) | `10485760` |
| `ALLOWED_HOSTS` | CORS allowed origins | `http://localhost:3000` |

### Frontend Configuration (`client/.env.local`)

| Parameter | Description | Default |
|-----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `NEXT_PUBLIC_MAX_UPLOAD_SIZE` | Max upload size for client validation | `10485760` |

## 📚 API Documentation

### Endpoints

#### Upload Endpoints
- `POST /api/v1/upload/single` - Upload single image
- `POST /api/v1/upload/batch` - Upload multiple images
- `GET /api/v1/upload/status/{filename}` - Check upload status

#### Analysis Endpoints
- `POST /api/v1/analysis/single` - Analyze single image
- `POST /api/v1/analysis/batch` - Start batch analysis
- `GET /api/v1/analysis/batch/{batch_id}/status` - Get batch status
- `GET /api/v1/analysis/batch/{batch_id}/results` - Get batch results

#### Utility Endpoints
- `GET /health` - Health check
- `GET /api/v1/analysis/result/{analysis_id}/visualization/{type}` - Get visualization images

### Response Formats

All responses follow consistent JSON format:
```json
{
  "status": "success|error",
  "message": "Human readable message",
  "data": { ... }
}
```

## 🧠 Fish Analysis Model

The platform uses a custom-trained segmentation model capable of detecting:

- **Trout body** - Main fish body segmentation
- **Eyes** - Eye detection for orientation
- **Fins** - Pectoral, dorsal, caudal, adipose, pelvic, and anal fins
- **Operculum** - Gill cover detection

### Measurements Provided

1. **Linear Measurements**:
   - Head to pectoral fin
   - Head to operculum
   - Head to dorsal fin
   - Total fish length
   - Various fin-to-fin measurements

2. **Area Measurements**:
   - Eye area
   - Body area (when applicable)

3. **Analysis Features**:
   - Color analysis with dominant colors
   - Lateral line linearity assessment
   - Confidence scores for all detections

## 🔍 Troubleshooting

### Common Issues

1. **Model not found error**:
   - Ensure `best.pt` model file is in `server/documents/` directory
   - Check the `MODEL_PATH` in your `.env` file

2. **CORS errors**:
   - Verify `ALLOWED_HOSTS` includes your frontend URL
   - Check that both frontend and backend are running

3. **Upload failures**:
   - Verify file size is under the maximum limit
   - Ensure file format is supported (JPEG, PNG, BMP, TIFF)
   - Check that the image contains a visible grid pattern

4. **Analysis errors**:
   - Ensure image has sufficient quality and resolution
   - Verify grid pattern is clearly visible
   - Check that fish is properly positioned in the image

### Performance Optimization

- **GPU Acceleration**: Install CUDA for faster analysis
- **Batch Size**: Adjust batch size based on available memory
- **Image Size**: Resize large images for faster processing
- **Caching**: Enable result caching for repeated analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

<!-- Removed explicit model naming for a vendor-neutral description -->
- **FastAPI** for the high-performance web framework
- **Next.js** for the modern React framework
- **OpenCV** for computer vision capabilities
- **Tailwind CSS** for styling

## 📞 Support

For support and questions:
- 📧 Email: support@octapulse.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/octapulse-core/issues)
- 📚 Documentation: [Full Documentation](https://docs.octapulse.com)

---

Built with ❤️ for the aquaculture industry
