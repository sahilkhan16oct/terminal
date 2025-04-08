const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const pty = require('node-pty');
const fs = require('fs');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { execSync } = require('child_process');
const { getQuestion, loadQuestions, questions } = require('./questionsHandler');

mongoose.connect("mongodb+srv://innoveotech:LPVlwcASp0OoQ8Dg@azeem.af86m.mongodb.net/InterviewDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  test: {
    type: Object,
    default: {}
  }
});
const User = mongoose.model('user', userSchema);


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(bodyParser.json());
const _dirname=path.dirname("")
const buildpath = path.join(_dirname,"../interview-platform/build")
app.use(express.static(buildpath));
app.use(cors());
// app.use(express.static(path.join(__dirname, 'public')));


// ✅ **Ensure the logs directory exists**
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}


// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });


// API route to get a new question every request
loadQuestions();

app.get("/api/question/:index", (req, res) => {
  const index = parseInt(req.params.index);

  if (index >= questions.length) {
    return res.json({ question: "Finish", isLast: true });
  }

  res.json({
    question: questions[index].text,
    isLast: index === questions.length - 1,  // ✅ Fixing this logic
  });
});



// ✅ API to get current test number
// ✅ API to get user progress
app.get('/api/user-progress/:username', async (req, res) => {
  const { username } = req.params;
  const user = await User.findOne({ username });

  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  return res.json({ success: true, testNumber: user.testNumber });
});

app.get("/api/test-count", (req, res) => {
  const questionsDir = path.join(__dirname, "questions");

  try {
    const files = fs.readdirSync(questionsDir);
    const testFiles = files.filter(file => file.startsWith("test") && file.endsWith(".txt"));
    const testCount = testFiles.length; // Count total tests available
    console.log(testCount);

    res.json({ success: true, testCount });
  } catch (error) {
    console.error("❌ Error reading test files:", error);
    res.status(500).json({ success: false, message: "Failed to get test count" });
  }
});

app.post("/api/question", async (req, res) => {
  const { testNumber, questionIndex, username } = req.body;

  if (!testNumber || questionIndex === undefined || !username) {
    return res.status(400).json({ success: false, message: "Missing parameters" });
  }

  const testNum = parseInt(testNumber.replace("test", ""));

  if (isNaN(testNum) || isNaN(questionIndex)) {
    return res.status(400).json({ success: false, message: "Invalid test number or question index" });
  }

  const questionData = getQuestion(testNum, parseInt(questionIndex));

  if (questionData.allDone) {
    return res.json({ question: "All tests completed!", isLast: true, allDone: true });
  }

  res.json(questionData);
});



// ✅ API to validate test
app.post('/api/validate-test', async (req, res) => {
  const { username, testNumber } = req.body;

  if (!username || !testNumber) {
    return res.status(400).json({ success: false, message: "Username and test number are required" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const userFilePath = `/home/${username}/answer${testNumber}.txt`;
  const referenceFilePath = path.join(__dirname, 'answers', `test${testNumber}_answers.txt`);

  try {
    let marks = 0;

    if (fs.existsSync(userFilePath)) {
      marks = 40; // File exists => base marks
      let userAnswer = execSync(`sudo cat ${userFilePath}`).toString().trim();
      const correctAnswer = fs.readFileSync(referenceFilePath, 'utf-8').trim();

      if (userAnswer === correctAnswer) {
        marks = 100; // Exact match
      } else if (userAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
        marks = 75; // Case-insensitive match
      }
    } else {
      return res.status(400).json({ success: false, message: "User answer file not found" });
    }

    const passed = marks > 70;

    // ✅ Save test result
    const testKey = `test${testNumber}`;
    const updateData = {
      [`test.${testKey}`]: {
        marks,
        passed,
        date: new Date()
      }
    };

    await User.updateOne({ username }, { $set: updateData });

    return res.json({
      success: passed,              
      message: passed ? "Test passed" : "Test failed",
      marks,
      passed
    });

  } catch (error) {
    console.error("❌ Error validating test:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});




// ✅ **Login API - Creates a Lightweight System User**
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });

  if (user) {
    try {
      // ✅ **Check if user exists in the system**
      const userExists = execSync(`id -u ${username} 2>/dev/null || echo "no"`).toString().trim();

      if (userExists === "no") {
        console.log(`🆕 Creating user: ${username}`);

        // ✅ **Create a minimal user**
        execSync(`sudo useradd -M -s /bin/bash ${username}`);

        // ✅ **Set up the virtual disk file in kb or mb)**
        const userDisk = `/home/${username}.img`;
        const userHome = `/home/${username}`;

        console.log(`📦 Creatin 1 MB disk for ${username}`);
        execSync(`sudo fallocate -l 1M ${userDisk}`);
        execSync(`sudo mkfs.ext2 ${userDisk}`);
        execSync(`sudo chmod 600 ${userDisk}`);

        // ✅ **Create home directory and mount the disk**
        execSync(`sudo mkdir -p ${userHome}`);
        execSync(`sudo mount -o loop ${userDisk} ${userHome}`);
        execSync(`sudo chmod 700 ${userHome}`);
        execSync(`sudo chown ${username}:${username} ${userHome}`);

        // ✅ **Persist mount in /etc/fstab**
        execSync(`echo "${userDisk} ${userHome} ext2 loop,defaults 0 0" | sudo tee -a /etc/fstab`);

        console.log(`✅ User ${username} created with 1MB disk.`);
      } else {
        console.log(`🔹 User ${username} already exists.`);
      }

      res.json({ success: true, username });
    } catch (error) {
      console.error("❌ Error creating user:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

// ✅ **Logout API - Remove User and Disk**
app.post('/logout', async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ success: false, message: "No username provided" });
  }

  try {
    console.log(`🔴 Logging out user: ${username}`);

    // ✅ Check if user exists
    try {
      execSync(`id ${username}`, { stdio: 'ignore' });
    } catch (error) {
      return res.status(400).json({ success: false, message: "User does not exist" });
    }

    // ✅ Kill all user processes
    try {
      execSync(`sudo pkill -KILL -u ${username}`, { stdio: 'ignore' });
      console.log(`🔪 Killed all processes for ${username}.`);
    } catch (error) {
      console.warn(`⚠️ No running processes found for ${username}.`);
    }

    // ✅ Unmount and remove home directory
    const userDisk = `/home/${username}.img`;
    const userHome = `/home/${username}`;
    try {
      execSync(`sudo umount ${userHome}`);
      execSync(`sudo rm -rf ${userHome}`);
      console.log(`🗑️ Unmounted and removed home directory for ${username}.`);
    } catch (error) {
      console.warn(`⚠️ Failed to unmount/remove home directory for ${username}: ${error}`);
    }

    // ✅ Remove user's disk image
    try {
      execSync(`sudo rm -f ${userDisk}`);
      console.log(`🗑️ Deleted disk image for ${username}.`);
    } catch (error) {
      console.warn(`⚠️ Failed to remove disk image for ${username}: ${error}`);
    }

    // ✅ Remove the /etc/fstab entry
    try {
      execSync(`sudo sed -i '\\|/home/${username}.img|d' /etc/fstab`);
      console.log(`🗑️ Removed fstab entry for ${username}.`);
    } catch (error) {
      console.warn(`⚠️ Failed to remove fstab entry for ${username}: ${error}`);
    }

    // ✅ Delete user after unmounting
    try {
      execSync(`sudo userdel ${username}`);
      console.log(`🗑️ User ${username} deleted.`);
    } catch (error) {
      console.error(`❌ Failed to delete user: ${error}`);
      return res.status(500).json({ success: false, message: "Failed to delete user" });
    }

    return res.json({ success: true, message: "User logged out successfully." });

  } catch (error) {
    console.error("❌ Error during logout:", error);
    return res.status(500).json({ success: false, message: "Logout failed" });
  }
});



// ✅ **WebSocket for Terminal**
wss.on('connection', (ws, req) => {
  let username = new URL(req.url, `http://${req.headers.host}`).searchParams.get('username');

  if (!username) {
    console.log("❌ No username provided, closing WebSocket.");
    ws.close();
    return;
  }

  console.log(`🔹 WebSocket connected for user: ${username}`);
  const userDir = `/home/${username}`;

  try {
    // ✅ **Spawn a shell with restricted access**
    const ptyProcess = pty.spawn('sudo', ['-u', username, 'bash'], {
      name: 'xterm-color',
      cols: 80,
      rows: 30,
      cwd: userDir,
      env: { ...process.env, HOME: userDir }
    });

    ptyProcess.on('data', (data) => ws.send(data));
    ws.on('message', (message) => ptyProcess.write(message));
    ws.on('close', () => ptyProcess.kill());

  } catch (error) {
    console.error("❌ Error starting terminal:", error);
    ws.close();
  }
});

server.listen(4000, () => console.log('🚀 Server running at http://localhost:4000'));
