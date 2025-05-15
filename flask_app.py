from flask import Flask, request, redirect
import random
import string
import os

app = Flask(__name__)
CODES_FILE = "codes.txt"

# 工具函数：生成随机签到码
def generate_random_code(length=10):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length))

# 工具函数：加载签到码文件为字典
def load_codes():
    codes = {}
    if os.path.exists(CODES_FILE):
        with open(CODES_FILE, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if len(parts) == 2:
                    codes[parts[0]] = parts[1]
    return codes

# 工具函数：保存字典回文件
def save_codes(codes):
    with open(CODES_FILE, 'w') as f:
        for code, sid in codes.items():
            f.write(f"{code} {sid}\n")

# 路由 A：生成签到码
@app.route('/codes')
def generate_codes():
    codes = {}
    while len(codes) < 100:
        code = generate_random_code()
        codes[code] = '0'
    save_codes(codes)

    # 格式化输出 20行 × 5列
    output = "<pre>"
    codes_list = list(codes.keys())
    for i in range(0, 100, 5):
        output += '   '.join(f"{code}" for code in codes_list[i:i+5]) + "\n"
    output += "</pre>"
    return output

# 路由 B：学生签到表单
@app.route('/signin')
def signin_form():
    return '''
    <form method="post" action="/verify">
        Student ID: <input name="sid"><br>
        Sign-in Code: <input name="code"><br>
        <input type="submit" value="Sign in">
    </form>
    '''

# 路由 C：验证签到码
@app.route('/verify', methods=['GET', 'POST'])
def verify():
    sid = request.values.get("sid")
    code = request.values.get("code")
    codes = load_codes()

    if code not in codes:
        return "Wrong code entered"
    
    signedSid = codes[code]
    if signedSid == '0':
        codes[code] = sid
        save_codes(codes)
        return "You are successfully signed in"
    elif signedSid == sid:
        return "You have signed in already"
    else:
        return f"The code is used by {signedSid} and cannot be shared"

# 路由 D：教师查看已签到学生
@app.route('/attended')
def attended():
    codes = load_codes()
    attended_students = [sid for sid in codes.values() if sid != '0']
    output = "<pre>\n"
    for sid in attended_students:
        output += f"{sid}\n"
    output += "</pre>"
    return output

if __name__ == '__main__':
    app.run(debug=True)
