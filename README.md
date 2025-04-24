## Các dòng code trả lời test ở trong mục backend

## Các bước run project

#### 1. Chạy sever local:

```bash
cd ./backend/
```

```bash
conda create -n chatbot-env python=3.11.11 -y
```

```
conda activate chatbot-env
```

```
pip install -r requirements.txt
```

```
uvicorn main:app --reload -- port 8000
```

#### 2. Chạy website:

```bash
cd ./frontend/
```

```
npm i
```

```
npm run dev
```
