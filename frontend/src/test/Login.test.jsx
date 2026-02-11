import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // toHaveBeenCalledWith 같은 matcher를 사용하기 위해 import
import Login from '../features/auth/components/Login'; // Login.jsx 파일명에 따라 경로 수정
import { useAuth } from '../features/auth/hooks/useAuth'; // useAuth import 추가

// api 클라이언트를 모의(mock) 처리합니다.
import { api } from '../api/client';
jest.mock('../api/client', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn()
  }
}));

// useAuth 훅을 모의(mock) 처리합니다.
jest.mock('../features/auth/hooks/useAuth');


// 테스트 스위트(Test Suite) 정의
describe('Login Component', () => {
  // 각 테스트가 실행되기 전에 localStorage를 초기화하고, 모의 함수들을 생성
  let mockOnClose;
  let mockOnLoginSuccess;
  let mockOnClickSignUp;
  let mockLogin; // login 함수 mock

  beforeEach(() => {
    // localStorage의 setItem 함수를 감시하여 jest matcher(toHaveBeenCalledWith)를 사용할 수 있도록 합니다.
    jest.spyOn(window.localStorage, 'setItem');
    localStorage.clear();

    // 각 테스트 전에 모의 함수 기록을 초기화합니다.
    jest.clearAllMocks();

    mockOnClose = jest.fn();
    mockOnLoginSuccess = jest.fn();
    mockOnClickSignUp = jest.fn();
    mockLogin = jest.fn(); // login 함수 mock 초기화

    // window.alert 모의 함수 설정
    jest.spyOn(window, 'alert').mockImplementation(() => {});

    // useAuth가 mockLogin을 반환하도록 설정
    useAuth.mockReturnValue({
        login: mockLogin
    });
  });



  test('컴포넌트가 올바르게 렌더링된다', () => {
    render(
      <Login
        isOpen={true}
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
        onClickSignUp={mockOnClickSignUp}
      />
    );

    // 제목, 입력창, 버튼이 보이는지 확인
    expect(screen.getByRole('heading', { name: '로그인' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('아이디를 입력하세요')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('비밀번호를 입력하세요')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  test('입력 없이 제출 시 에러 메시지를 표시한다', async () => {
    render(
      <Login
        isOpen={true}
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
        onClickSignUp={mockOnClickSignUp}
      />
    );

    const loginButton = screen.getByRole('button', { name: '로그인' });
    fireEvent.click(loginButton);

    // 에러 메시지가 나타나는지 비동기적으로 확인
    const errorMessage = await screen.findByText('아이디와 비밀번호를 입력해주세요.');
    expect(errorMessage).toBeInTheDocument();
  });



  test('성공적으로 로그인하면 localStorage에 토큰을 저장하고 onLoginSuccess를 호출한다', async () => {
    // 1. api.post가 성공적으로 토큰 데이터를 반환하도록 설정합니다.
    const mockTokenData = {
      accessToken: 'mock-access-token-123',
      refreshToken: 'mock-refresh-token-456',
    };
    api.post.mockResolvedValue(mockTokenData);

    render(
      <Login
        isOpen={true}
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
        onClickSignUp={mockOnClickSignUp}
      />
    );

    // 2. 사용자 입력 시뮬레이션
    fireEvent.change(screen.getByPlaceholderText('아이디를 입력하세요'), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호를 입력하세요'), {
      target: { value: 'password123' },
    });

    // 3. 로그인 버튼 클릭
    const loginButton = screen.getByRole('button', { name: '로그인' });
    fireEvent.click(loginButton);

    // 4. 비동기 작업(handleSubmit)이 끝날 때까지 기다린 후 검증
    await waitFor(() => {
      // api.post가 올바른 인자와 함께 호출되었는지 확인
      expect(api.post).toHaveBeenCalledWith('login', { username: 'testuser', password: 'password123' });

      // localStorage.setItem이 올바른 인자와 함께 호출되었는지 확인
      expect(localStorage.setItem).toHaveBeenCalledWith('accessToken', expect.any(String));
      expect(localStorage.setItem).toHaveBeenCalledWith('refreshToken', expect.any(String));
      
      // onLoginSuccess 콜백 함수가 호출되었는지 확인
      expect(mockOnLoginSuccess).toHaveBeenCalled();
    });
  });



  test('로그인 실패 시 에러 메시지를 표시한다', async () => {
    // 1. 로그인 실패(401 Unauthorized)를 시뮬레이션하는 가짜 fetch 함수를 설정합니다.
    const errorMessageFromServer = '아이디 또는 비밀번호가 일치하지 않습니다.';
    api.post.mockRejectedValue(new Error(errorMessageFromServer));

    render(
      <Login
        isOpen={true}
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
        onClickSignUp={mockOnClickSignUp}
      />
    );

    // 2. 사용자 입력 시뮬레이션
    fireEvent.change(screen.getByPlaceholderText('아이디를 입력하세요'), {
      target: { value: 'wronguser' },
    });
    fireEvent.change(screen.getByPlaceholderText('비밀번호를 입력하세요'), {
      target: { value: 'wrongpassword' },
    });

    // 3. 로그인 버튼 클릭
    const loginButton = screen.getByRole('button', { name: '로그인' });
    fireEvent.click(loginButton);

    // 4. 에러 메시지가 화면에 나타나는지 확인
    const errorMessage = await screen.findByText(errorMessageFromServer);
    expect(errorMessage).toBeInTheDocument();
    expect(mockOnLoginSuccess).not.toHaveBeenCalled(); // onLoginSuccess는 호출되지 않아야 함
  });



  test("'계정이 없어요' 버튼 클릭 시 onClickSignUp 함수를 호출한다", () => {
    render(
      <Login
        isOpen={true}
        onClose={mockOnClose}
        onLoginSuccess={mockOnLoginSuccess}
        onClickSignUp={mockOnClickSignUp}
      />
    );

    const signupButton = screen.getByRole('button', { name: '계정이 없어요' });
    fireEvent.click(signupButton);

    expect(mockOnClickSignUp).toHaveBeenCalled();
  });



  test("오버레이 클릭 시 onClose가 호출된다", () => {
        render(
            <Login
                isOpen={true}
                onClose={mockOnClose}
                onLoginSuccess={mockOnLoginSuccess}
                onClickSignUp={mockOnClickSignUp}
            />
        );
        // data-testid를 사용하여 오버레이 요소를 정확하게 선택합니다.
        const overlay = screen.getByTestId("overlay");
        fireEvent.mouseDown(overlay);
        expect(mockOnClose).toHaveBeenCalled();
    }); 
});
