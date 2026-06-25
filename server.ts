import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with custom Telemetry User-Agent
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// Helper to get Gemini client, supporting custom user API Key sent in headers
const getAiClient = (req: express.Request) => {
  const customApiKey = req.headers["x-api-key"] as string;
  if (customApiKey) {
    return new GoogleGenAI({
      apiKey: customApiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return ai;
};


// API: Check system health and API conditions
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// API: Recommend books based on user interests, reading level (ZPD) and goals.
app.post("/api/mentor/recommend", async (req, res) => {
  try {
    const client = getAiClient(req);
    if (!client) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not set. Please add it to your secrets.",
      });
    }

    const { interests, vocabularyLevel, goals, currentBooksCount } = req.body;

    const systemInstruction = `
Bạn là một Chuyên gia Tâm lý Giáo dục và Cố vấn Đọc sách Thông minh (AI Reading Mentor).
Nhiệm vụ của bạn là dựa trên thông tin định hướng của học sinh để đề xuất 3 cuốn sách thuộc hoặc cận kề "Vùng phát triển gần nhất" (ZPD) của học sinh.
Thông tin học sinh cung cấp:
- Sở thích/Lĩnh vực: ${interests || "Nhiều lĩnh vực khác nhau"}
- Trình độ từ vựng/đọc hiểu tự đánh giá: ${vocabularyLevel || "Trung bình"}
- Mục tiêu cá nhân: ${goals || "Đọc sách hàng ngày"}

Quy tắc đề xuất (ZPD Rule):
- Chọn sách có độ khó cao hơn trình độ đọc hiểu hiện tại khoảng 10-15% để kích thích tư duy mà không gây nản lòng.
- Gợi ý những cuốn sách phổ biến, có giá trị giáo dục, phù hợp với tâm lý lứa tuổi học sinh THPT Việt Nam (Gen Z) (Có thể là văn học kinh điển, sách khoa học phổ thông, phát triển bản thân, kỹ năng mềm, v.v.).
- Chia sẵn sách thành các "Mục tiêu siêu nhỏ" (Micro-goals) lý tưởng cho bạn học sinh đó (ví dụ: "Phiên đọc 8 trang / ngày" hoặc "12 phút mỗi tối").

Bạn PHẢI trả về dữ liệu dưới định dạng JSON là một mảng gồm đúng 3 đối tượng sách có cấu trúc như sau:
[
  {
    "title": "Tên sách",
    "author": "Tác giả",
    "category": "Thể loại (VD: Văn học, Khoa học, Bản thân)",
    "zpdRating": "Mức độ phù hợp ZPD (VD: Thử thách nhẹ +12%, Vừa vặn phát triển +10%)",
    "whyRecommend": "Lý do đề xuất cuốn sách này dựa trên sở thích và từ vựng",
    "microGoal": {
      "pagesPerSession": 8,
      "timeEstimateMinutes": 15,
      "totalSessions": 25,
      "sessionDescription": "Đọc 8 trang sách (khoảng 15 phút) mỗi ngày trước khi đi ngủ."
    },
    "skillsUnlocked": "Các kỹ năng sẽ mở khóa (VD: Đồng cảm, Tư duy Phản biện, Từ vựng xã hội)",
    "coverTheme": "Một chuỗi màu CSS gradient phù hợp làm nền (VD: 'from-blue-600 to-indigo-700')"
  }
]
Tuyệt đối chỉ trả về JSON thuần túy, không có thẻ bao ngoài Markdown, không có văn bản thừa.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Hãy đề xuất sách phù hợp với thông tin người dùng.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "[]";
    const recommendedBooks = JSON.parse(text.trim());
    res.json({ recommendedBooks });
  } catch (error: any) {
    console.error("Error in recommend API:", error);
    res.status(500).json({ error: error.message || "Failed to recommend books" });
  }
});

// API: Chat Endpoint for Socratic reading mentor session
app.post("/api/mentor/chat", async (req, res) => {
  try {
    const client = getAiClient(req);
    if (!client) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not set. Please add it to your secrets in Settings.",
      });
    }

    const {
      chatHistory,
      bookTitle,
      bookAuthor,
      sessionPages,
      studentMessage,
      streakCount,
      studentXP,
      vibeLevel,
    } = req.body;

    // Build chat instruction
    const systemInstruction = `
Bạn là AI Reading Mentor (Người Đồng Hành Đọc Sách Thông Minh) - một cố vấn tâm lý giáo dục và đọc sách dành cho học sinh THPT Việt Nam (Gen Z).
Bạn đang thảo luận với học sinh về cuốn sách "${bookTitle}" của tác giả "${bookAuthor}".
Học sinh vừa hoàn thành một phiên đọc sách mục tiêu siêu nhỏ: ${sessionPages || "5-10"} trang.

PHƯƠNG PHÁP TƯƠNG TÁC (Bạn phải tuân thủ nghiêm ngặt):
1. Thúc đẩy tư duy phản biện & Active Recall bằng Socratic Method:
   - Hãy đặt câu hỏi gợi mở sâu sắc thay vì tóm tắt cuốn sách hộ học sinh.
   - Sử dụng Kỹ thuật Feynman: Thúc đẩy học sinh giải thích các khái niệm phức tạp trong chương vừa đọc bằng ngôn từ cực kỳ giản dị, đời thường của học sinh THPT.
   - Thử thách nhập vai (Role-play): Đặt câu hỏi như "Nếu bạn là nhân vật X ở tình huống này, bạn có làm khác đi không? Tại sao?".
   - Gắn kết bài học với đời sống học sinh: Liên hệ thông tin trong sách với bối cảnh đời sống học bạ, trường học, định hướng tương lai hoặc các mâu thuẫn lứa tuổi Gen Z đang trải qua.

2. Tone & Persona:
   - "Peer-to-Peer Mentor": Thân thiện, gần gũi, khích lệ như một người anh/chị khóa trên cực đỉnh chứ không giáo điều, không tỏ vẻ bề trên.
   - Ngôn ngữ: Tiếng Việt, trẻ trung, hiện đại, sử dụng một số từ ngữ quen thuộc của Gen Z (hợp ngữ cảnh, lịch sự nhưng gần gũi), dùng emoji phong phú.
   - Luôn hướng nghiệp/định hướng tích cực. Nếu học sinh nói bỏ lỡ mục tiêu hoặc bận rộn, hãy dùng "Thuyết cú hích" (Nudges) đề xuất giải pháp siêu đơn giản: "Không sao cả, chỉ cần dành ra đúng 2 phút lật 2 trang sách hôm nay là ngọn lửa thăng tiến của cậu sẽ được nối lại rồi!".

3. Gamification Updates:
   - Cập nhật tiến độ của học sinh trong thông báo (VD: Chuỗi ngày đọc (Streak): ${streakCount || 0} ngày, XP hiện tại: ${studentXP || 0}).
   - Tặng điểm thưởng ảo (+10 XP đến +25 XP tùy theo mức độ câu trả lời sâu sắc của học sinh) và tăng các chỉ số kỹ năng như: "Tư duy phản biện", "Khả năng đồng cảm", "Vốn từ vựng", hoặc "Tư duy hệ thống".

CƠ CẤU PHẢN HỒI (Mọi câu trả lời của bạn phải có đủ 4 phần rõ ràng này bằng Tiếng Việt):

1. **Lời chào & Khích lệ (Greeting):**
   Một câu phản hồi cá nhân ngắn ấm áp hoặc khích lệ dựa trên lời nhắn của học sinh kèm emoji thích hợp. Đánh giá nhanh sự thấu hiểu của họ một cách tích cực.

2. **Tương tác Socratic chủ đạo (Main Interaction):**
   - Đưa ra phản hồi mổ xẻ câu trả lời trước đó của học sinh (nếu có).
   - Đặt tiếp 1 câu hỏi Socratic sắc sảo hoặc một thử thách liên hệ thực tế, kích thích Active Recall về nội dung đọc vừa rồi. Giữ cho câu hỏi ngắn gọn, không quá 2 câu hỏi trong một lượt.

3. **Ghi nhận Tăng trưởng (Gamification - Growth Tracking):**
   - Đưa ra một dòng ghi chú ngắn thông báo thành tựu tăng trưởng trong chuyến phiêu lưu kiến thức.
   - Ví dụ: "+20 XP đã nạp! Kỹ năng 'Sự Thấu Cảm' của cậu đã đạt cấp 2 (75/100 XP). Chuỗi Streak ${streakCount || 0} ngày vẫn rực cháy! 🔥"

4. **Lời nhắn Cú Hích (Smart Nudge):**
   - Một câu nudge thâm thúy, truyền cảm hứng hành động thiết thực cho phiên đọc tiếp theo hoặc cuộc sống hàng ngày.

Hãy tạo ra một cuộc hội thoại sinh động, hấp dẫn, đậm chất thông minh và thực tế giúp học sinh THPT yêu thích việc đọc sách.
`;

    // Map history to Google GenAI schema format
    const formattedContents: any[] = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      chatHistory.forEach((msg: any) => {
        formattedContents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      });
    }

    // Append current student message
    formattedContents.push({
      role: "user",
      parts: [{ text: studentMessage }],
    });

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.8,
      },
    });

    const mentorResponse = response.text || "Xin lỗi cậu, tớ đang gặp chút trục trặc nhỏ trong hệ thống kết nối trí tuệ. Cậu thử gửi lại nhé!";
    res.json({ mentorResponse });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    res.status(500).json({ error: error.message || "Failed to process chat" });
  }
});

// API: Analyze book information using AI
app.post("/api/mentor/analyze-book", async (req, res) => {
  try {
    const client = getAiClient(req);
    if (!client) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not set. Please configure it in Settings.",
      });
    }

    const { title, author } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Book title is required." });
    }

    const systemInstruction = `
Bạn là một Chuyên gia Thư viện và Cố vấn Đọc sách Thông minh (AI Reading Mentor).
Nhiệm vụ của bạn là phân tích cuốn sách có tựa đề "${title}" ${author ? `của tác giả "${author}"` : ""} và xây dựng lộ trình đọc chia nhỏ ZPD (Zone of Proximal Development) cho học sinh THPT.

Quy tắc thiết lập ZPD và mục tiêu siêu nhỏ (microGoal):
- Thể loại (category): Ghi nhận thể loại chính xác (VD: Văn học cổ điển, Phát triển bản thân, Khoa học phổ thông, Kỹ năng mềm, Lịch sử, Triết học...).
- Mức độ thử thách ZPD (zpdRating): Ước lượng mức độ khó hơn trình độ trung bình của học sinh THPT (VD: "Vừa vặn phát triển +10%", "Thử thách nhẹ +12%", "Thách thức tư duy +18%").
- Lý do đề xuất (whyRecommend): Giải thích ngắn gọn lý do học sinh cấp 3 nên đọc cuốn sách này bằng giọng văn khích lệ, thân thiện.
- Mục tiêu siêu nhỏ (microGoal): 
  + pagesPerSession: Số trang nên đọc trong một phiên (nên từ 5 đến 12 trang tùy độ khó).
  + timeEstimateMinutes: Thời gian đọc ước lượng (từ 8 đến 20 phút).
  + totalSessions: Tổng số phiên cần để hoàn thành cuốn sách (VD: 12, 15, 20, 25 phiên).
  + sessionDescription: Mô tả hành động đọc của phiên đó (VD: "Đọc 8 trang sách (khoảng 12 phút) mỗi tối để rèn luyện thói quen.").
- Kỹ năng mở khóa (skillsUnlocked): Kỹ năng học sinh nhận được (VD: Tư duy Phản biện, Thấu cảm nhân vật, Vốn từ học thuật, v.v. - phân tách bằng dấu phẩy).
- coverTheme: Chọn một chuỗi CSS gradient phù hợp làm nền (VD: 'from-orange-500 to-red-600', 'from-emerald-500 to-teal-700', 'from-blue-600 to-indigo-800', 'from-purple-600 to-pink-700', 'from-stone-600 to-stone-900').

Bạn PHẢI trả về dữ liệu dưới định dạng JSON là một đối tượng có cấu trúc chính xác như sau:
{
  "title": "Tên sách đầy đủ và đúng chính tả",
  "author": "Tác giả đầy đủ và đúng chính tả",
  "category": "Thể loại",
  "zpdRating": "Mức độ thử thách ZPD",
  "whyRecommend": "Lý do đề xuất",
  "microGoal": {
    "pagesPerSession": 8,
    "timeEstimateMinutes": 12,
    "totalSessions": 15,
    "sessionDescription": "Mô tả hành động của một phiên đọc"
  },
  "skillsUnlocked": "Các kỹ năng sẽ mở khóa",
  "coverTheme": "from-theme-color-1 to-theme-color-2"
}
Tuyệt đối chỉ trả về JSON thuần túy, không có thẻ bao ngoài Markdown, không có văn bản thừa.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Hãy phân tích cuốn sách và trả về thông tin chi tiết.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const bookDetails = JSON.parse(text.trim());
    res.json({ bookDetails });
  } catch (error: any) {
    console.error("Error in analyze-book API:", error);
    res.status(500).json({ error: error.message || "Failed to analyze book" });
  }
});

// API: Generate personalized daily nudge for reading
app.post("/api/mentor/generate-nudge", async (req, res) => {
  try {
    const client = getAiClient(req);
    if (!client) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not set. Please configure it in Settings.",
      });
    }

    const { name, interests, goals, activeBookTitle, activeBookAuthor, streakCount } = req.body;

    const systemInstruction = `
Bạn là AI Reading Mentor (Người Đồng Hành Đọc Sách Thông Minh) của học sinh THPT Việt Nam (Gen Z).
Nhiệm vụ của bạn là viết một câu "Cú hích" (Nudge) cực kỳ dí dỏm, khích lệ và truyền cảm hứng để học sinh tiếp tục duy trì thói quen đọc sách hôm nay.

Thông tin học sinh:
- Tên: ${name || "học sinh"}
- Sở thích: ${interests || "đọc sách"}
- Mục tiêu: ${goals || "rèn luyện bản thân"}
- Sách đang đọc: ${activeBookTitle ? `"${activeBookTitle}" của tác giả ${activeBookAuthor}` : "chưa chọn sách"}
- Chuỗi streak hiện tại: ${streakCount || 0} ngày.

Yêu cầu về nội dung Nudge:
1. Thân thiện, gần gũi như một người anh/chị khóa trên, sử dụng ngôn ngữ trẻ trung, hiện đại của Gen Z một cách lịch sự, tinh tế (VD: dùng các từ như "nhen", "nè", "chứ lị", "đỉnh chóp", "cố lên", v.v., kèm emoji phong phú).
2. Nhắc nhở nhẹ nhàng về việc đọc sách hôm nay để duy trì chuỗi Streak (hoặc bắt đầu một chuỗi mới nếu streak = 0). Nếu học sinh có sách đang đọc, hãy nhắc tên cuốn sách đó.
3. Không giáo điều, không sáo rỗng. Hãy viết ngắn gọn từ 2 đến 3 câu.
4. Trả về định dạng JSON thuần túy có dạng:
{
  "message": "Nội dung cú hích"
}
Tuyệt đối chỉ trả về JSON thuần túy, không có thẻ bao ngoài Markdown, không có văn bản thừa.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Hãy tạo một cú hích đọc sách cá nhân hóa.",
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const nudgeData = JSON.parse(text.trim());
    res.json(nudgeData);
  } catch (error: any) {
    console.error("Error in generate-nudge API:", error);
    res.status(500).json({ error: error.message || "Failed to generate nudge" });
  }
});

// Serve frontend static assets & manage modes
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    // Vite middleware in dev mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving of built assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] AI Reading Mentor running on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
