import requests
import json
import time
import random
from typing import Dict, Any, Optional
from dataclasses import dataclass
import os

@dataclass
class Config:
    """配置类"""
    api_key: str
    base_url: str = "https://api.x.ai/v1/chat/completions"
    model: str = "grok-3-latest"

class GrokSearchTool:
    """Grok搜索工具类"""
    
    def __init__(self, config: Config):
        self.config = config
        self.session = requests.Session()
        
        # 设置默认请求头
        self.session.headers.update({
            'Authorization': f'Bearer {self.config.api_key}',
            'Content-Type': 'application/json',
        })
    
    def _validate_input(self, query: str) -> str:
        """验证输入查询"""
        if not isinstance(query, str):
            raise ValueError("查询必须是字符串类型")
        if not query.strip():
            raise ValueError("查询不能为空")
        return query.strip()
    
    def _add_delay(self):
        """添加随机延迟以避免频率限制"""
        delay = random.uniform(1, 3)  # 1-3秒随机延迟
        print(f"等待 {delay:.1f}秒 以避免频率限制...")
        time.sleep(delay)
    
    def search_web(self, query: str, verbose: bool = True) -> str:
        """
        搜索Web信息
        
        Args:
            query: 搜索查询，不要包含日期或年份
            verbose: 是否显示详细信息
            
        Returns:
            搜索结果字符串
        """
        # 验证输入
        validated_query = self._validate_input(query)
        
        # 验证API密钥
        if not self.config.api_key or self.config.api_key == 'your-api-key-here':
            raise ValueError('请设置有效的XAI API密钥')
        
        # 添加延迟
        self._add_delay()
        
        # 构建请求数据 - 使用与您代码完全相同的格式
        request_data = {
            "messages": [
                {
                    "role": "user",
                    "content": validated_query
                }
            ],
            "search_parameters": {
                "mode": "auto"
            },
            "model": self.config.model
        }
        
        try:
            if verbose:
                print('🔍 发送搜索请求到 X.AI API...')
                print(f'请求URL: {self.config.base_url}')
            
            response = self.session.post(
                self.config.base_url,
                json=request_data,
                timeout=30
            )
            
            if verbose:
                print(f'📡 响应状态: {response.status_code} {response.reason}')
            
            response_text = response.text
            if verbose:
                print(f'📄 响应内容前200字符: {response_text[:200]}')
            
            if not response.ok:
                error_info = {
                    400: "请求格式错误",
                    401: "API密钥无效",
                    403: "访问被拒绝，可能是API密钥权限问题",
                    404: "模型不存在或无权访问",
                    429: "请求频率过高",
                    500: "服务器内部错误"
                }
                
                error_msg = error_info.get(response.status_code, "未知错误")
                if verbose:
                    print(f'❌ 错误: {error_msg}')
                    print(f'📄 响应内容: {response_text[:500]}')
                
                raise requests.exceptions.HTTPError(
                    f'HTTP错误 {response.status_code}: {error_msg}'
                )
            
            try:
                data = response.json()
            except json.JSONDecodeError as e:
                raise ValueError(f'JSON解析失败: {e}\n响应内容: {response_text}')
            
            if verbose:
                print('✅ 搜索成功!')
            
            if data.get('choices') and data['choices'][0].get('message'):
                return data['choices'][0]['message']['content']
            else:
                raise ValueError(f'无效的响应格式: {json.dumps(data, ensure_ascii=False)}')
                
        except requests.exceptions.RequestException as e:
            print(f'❌ 网络请求失败: {e}')
            raise
        except Exception as e:
            print(f'❌ 搜索失败: {e}')
            raise

def load_config_from_file(config_path: str = 'config.json') -> Config:
    """从文件加载配置"""
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            config_data = json.load(f)
        
        return Config(
            api_key=config_data['xai']['api_key'],
            base_url=config_data['xai'].get('base_url', 'https://api.x.ai/v1/chat/completions'),
            model=config_data['xai'].get('model', 'grok-3-latest')
        )
    except FileNotFoundError:
        raise FileNotFoundError(f'配置文件 {config_path} 不存在')
    except KeyError as e:
        raise KeyError(f'配置文件缺少必需字段: {e}')
    except json.JSONDecodeError:
        raise ValueError('配置文件格式无效')

def create_config_from_input(api_key: str, base_url: str = None, model: str = None) -> Config:
    """从输入参数创建配置（适合Colab使用）"""
    return Config(
        api_key=api_key,
        base_url=base_url or "https://api.x.ai/v1/chat/completions",
        model=model or "grok-3-latest"
    )

def test_search():
    """测试搜索功能"""
    try:
        print('开始测试Grok搜索功能...')
        
        # 尝试从文件加载配置
        try:
            config = load_config_from_file()
        except:
            # 如果文件不存在，提示用户输入API密钥
            print('配置文件不存在，请输入API密钥:')
            api_key = input('请输入您的X.AI API密钥: ')
            config = create_config_from_input(api_key)
        
        # 创建搜索工具
        search_tool = GrokSearchTool(config)
        
        # 执行搜索
        query = "最新的人工智能技术发展"
        print(f'🔍 搜索查询: {query}')
        
        result = search_tool.search_web(query)
        
        print('\n📝 搜索结果:')
        print('=' * 50)
        print(result)
        
    except Exception as e:
        print(f'❌ 测试失败: {e}')

if __name__ == "__main__":
    test_search() 